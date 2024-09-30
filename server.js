const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(express.static("public"));

// Endpoint to trigger Puppeteer and get attendance data
app.get("/get-attendance", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });
    const page = await browser.newPage();

    // Go to the page where the function exists
    await page.goto(
      "https://mserp.kiet.edu/iitmsBc7v/5ATpfgP+mw7tYwMKyDFX8z+ybDDZNC4zuw+WZs=?enc=fldsFvHoSrZjoX/iOyB6YfwxTQn+AjMGk7UzoVAmN3c="
    ); // Replace with the correct page URL

    // Wait for the ShowAttendance function to be defined in the global scope
    await page.waitForFunction('typeof ShowAttendance === "function"');

    // Call the ShowAttendance function directly
    await page.evaluate(() => {
      return ShowAttendance(); // This will call the function within the page
    });

    // Wait for the specific network response from the ShowAttendance URL
    const targetResponse = await page.waitForResponse(
      (response) =>
        response.url() ===
          "https://mserp.kiet.edu/StudeHome.aspx/ShowAttendance" &&
        response.status() === 200
    );

    // Capture the response as JSON
    const jsonData = await targetResponse.json();

    // Save the JSON data to a file
    const filePath = "attendance_data.json"; // Specify the output file path
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2)); // Write the JSON data with formatting

    console.log(`JSON data has been saved to ${filePath}`);

    await browser.close();

    // Send success response
    res.json({ message: "Data has been successfully retrieved and saved." });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance data." });
  }
});

// Endpoint to serve the saved JSON data
app.get("/attendance-data", (req, res) => {
  try {
    const data = fs.readFileSync("attendance_data.json", "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading attendance data:", error);
    res.status(500).json({ error: "Failed to read attendance data." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
