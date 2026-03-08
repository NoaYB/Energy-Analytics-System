using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class EnergyAnalyticsService
{
    // IMPROVEMENT 1 (Memory): Replaced List<RawData> with IAsyncEnumerable<RawData>.
    // This enables stream processing, allowing the application to process millions of records 
    // sequentially without loading the entire dataset into RAM, preventing OutOfMemoryException.
    public async Task<List<DeviceResult>> CalculateEfficiencyMetricsAsync(IAsyncEnumerable<RawData> data)
    {
        if (data == null)
            return new List<DeviceResult>();

        // IMPROVEMENT 2 (Performance): Replaced List<DeviceResult> with a Dictionary.
        // The original code used `results.FirstOrDefault()` inside the loop, creating an O(n^2) bottleneck.
        // A dictionary reduces the lookup time for an existing device to O(1), making overall complexity O(n).
        var results = new Dictionary<string, DeviceResult>(StringComparer.OrdinalIgnoreCase);

        await foreach (var item in data)
        {
            // IMPROVEMENT 3 (Readability & Safety): Extracted multiple validation checks into a separate helper.
            // This clearly filters out bad and corrupt data efficiently before executing intensive operations.
            if (!IsValidItem(item))
                continue;

            var deviceId = item.DeviceId.Trim();

            
            var denominator = item.Temperature + 1.0;
            // prevent a division by zero
            if (denominator == 0.0)
                throw new InvalidOperationException(
                    $"Invalid temperature (-1) for device '{deviceId}' resulting in division by zero.");

            var powerUsage = item.Voltage * item.Current;

            // IMPROVEMENT 4 (CPU Optimization): Removed redundant math operations. 
            // Original code used `Math.Pow(Math.Sqrt(X), 2)`, which mathematically cancels out for positive numbers.
            var efficiencyFactor = (powerUsage * 0.85) / denominator;

            if (results.TryGetValue(deviceId, out var existingDevice))
            {
                existingDevice.TotalPower += powerUsage;
                existingDevice.ReadingsCount++;

                // IMPROVEMENT 5 (Logic Bug Fix): Original code used `(average + new_val) / 2` which is mathematically
                // incorrect for a true moving average. We introduced a true `EfficiencySum` accumulator property,
                // and compute the final average during the last step.
                existingDevice.EfficiencySum += efficiencyFactor; 
            }
            else
            {
                results[deviceId] = new DeviceResult
                {
                    DeviceId = deviceId,
                    TotalPower = powerUsage,
                    ReadingsCount = 1,
                    EfficiencySum = efficiencyFactor
                };
            }
        }

        foreach (var result in results.Values)
            result.AverageEfficiency = result.EfficiencySum / result.ReadingsCount;

        return results.Values.ToList();
    }

    private static bool IsValidItem(RawData item)
    {
        if (item == null)
            return false;

        if (string.IsNullOrWhiteSpace(item.DeviceId))
            return false;

        if (!IsFinite(item.Voltage) || !IsFinite(item.Current) || !IsFinite(item.Temperature))
            return false;

        return true;
    }

    private static bool IsFinite(double value) =>
        !(double.IsNaN(value) || double.IsInfinity(value));
}

public class RawData
{
    public string DeviceId { get; set; }
    public double Voltage { get; set; }
    public double Current { get; set; }
    public double Temperature { get; set; }
}

public class DeviceResult
{
    public string DeviceId { get; set; }
    public double TotalPower { get; set; }
    public int ReadingsCount { get; set; }
    public double EfficiencySum { get; set; }
    public double AverageEfficiency { get; set; }
}