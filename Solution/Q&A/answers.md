# Deep Dive Questions

**1. If we needed to move the calculation logic to a resource-constrained Embedded component (C++/Assembly), what memory considerations would you take into account?**

In a memory-constrained embedded environment, I would consider:
* **Use accumulators:** I would only keep single variables that accumulate the totals (e.g., total current and reading count) to calculate the average, without saving the numbers themselves.
* **Data types:** I would use smaller data types (e.g., `float` instead of `double`, or `int`).
* **Static memory allocation:** I would avoid dynamic memory allocation (like `new` in C++) during runtime to prevent sudden out-of-memory crashes.

---

**2. How would you secure the API Endpoint that exposes device data?**

To prevent unauthorized access to device data or AI model API keys, I would secure the endpoint by:
* **Authentication & Authorization:** Using tokens (like JWT) to ensure only registered and authorized users can access specific device data.
* **Rate Limiting:** Limiting the number of requests a user/IP can make to prevent DDoS attacks or data scraping.
* **HTTPS only:** Encrypting all traffic between the browser and the server.
* **Backend Proxy:** The browser should never call third-party servers (like OpenAI) directly. Our backend server should make these calls and securely hold the secret keys.

---

**3. What questions would you ask the Product Manager before developing the AI Insights component?**

To ensure the development meets user needs, I would ask the Product Manager:

* **"Can the user provide feedback for ai insights?"** Should we add "False Alarm" or "Accurate" buttons to collect data for future model improvements?
* **"What is the frequency of AI calls?"** Are we sending data once a day for a summary report?
* **"What are the data privacy limitations?"** Is it acceptable to send device or usage data to OpenAI? Should we limit the data first?
