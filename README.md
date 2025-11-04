# Spreadsheet Expense Tracker

This app uses Google Spreadsheet as a database for tracking expenses. To set everything up, you need to follow the steps outlined here to properly connect your spreadsheet to the app.

## Full Backend Setup

For a more detailed backend setup guide, see: [How to Use Google Sheets As a Database For Your Business](https://blog.coupler.io/how-to-use-google-sheets-as-database/#Use_Google_Sheets_as_a_database_for_a_website).

<img width="656" height="807" alt="image" src="https://github.com/user-attachments/assets/9fae94fc-abf3-4f67-a2eb-9a84345fcc96" />



## Getting Started

### Install dependencies:

```bash
npm install
# or
yarn install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setup Spreadsheet

To make sure your Google Sheets are accessible by the program, follow these steps:

### Organize Your Spreadsheet

[Example spreadsheet](https://docs.google.com/spreadsheets/d/1o8PrpO-ye_H_Cdfe0HDQAf3VfY1kKZSm4uWx4ODNTeg/edit?usp=sharing)

1. **Create a "Data" Sheet**:

   - Your Google Sheet should have a sheet called "Data" where all your expense categories are listed in column A.
   - You can add background colors for each category in column B. This sheet should be your first sheet in the Google Sheets document.

   <img width="260" alt="image" src="https://github.com/user-attachments/assets/f520b69c-698a-40c9-af56-cfa20ab6af26">

2. **Create Monthly Sheets**:
   - You need to manually add sheets for each month. The app will record expenses into the last sheet (i.e., the most recent one).
   - By default, the app will enter expense data into columns A, B, and C with the following data: category, value, and description.
   - If you need to change this behavior, modify the `sheetRange` variable in `src/pages/api/track.ts`.
  
<img width="716" alt="image" src="https://github.com/user-attachments/assets/89355626-d996-41ae-8130-f8a13de1f234">


### Authentication with Google Sheets API

To allow your app to access the Google Sheets API, follow these authentication steps:

1. **Create a Google Cloud Project and Service Account**:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project by clicking on the project dropdown at the top and selecting **New Project**.
   - After creating the project, navigate to **APIs & Services** > **Dashboard**.
   - Click on **Enable APIs and Services** and search for "Google Sheets API". Enable this API for your project.
   - Now, go to **APIs & Services** > **Credentials**.
   - Click on **Create Credentials** and select **Service Account**.
   - Fill in the required details for the service account (e.g., name, description). You can leave the roles section as is.
   - Once the service account is created, click on it in the credentials list, and then go to the **Keys** tab.
   - Click on **Add Key** > **Create New Key** and select **JSON**. This will download a JSON file containing the credentials you need.
   - The JSON file will contain the `client_email` and `private_key` needed for authentication.

2. **Share Spreadsheet**:

   - Share your Google Spreadsheet with the **service account email**. This allows the app to access and edit the spreadsheet.

3. **Generate Service Account Key**:

   - The JSON file (`client_secret.json`) you downloaded contains the key details. You only need the `client_email` and `private_key` from this file.

4. **Configure Environment Variables**:

   - In the project root, create a `.env` file with the following values:

   ```
   CLIENT_EMAIL=*************@test-api-project-**************************.com
   PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...Ggg=\n-----END PRIVATE KEY-----\n"
   SPREADSHEET_ID="1m4qUwDiD*****************b9SWogQ0_QWyVssyw0"
   ```

   - The `SPREADSHEET_ID` can be found in the Google Sheets URL:

   ![image](https://github.com/MarkoIvanetic/spreadsheet-expense-tracker/assets/9166755/4f3bec15-228b-47fe-bb78-dba124d7467b)

5. **Google Sheets API Permissions**:
   - Make sure that your Google Cloud Project has the **Google Sheets API** enabled.
   - You can enable the API by navigating to the [Google Cloud Console](https://console.cloud.google.com/), finding your project, and enabling the Google Sheets API.

### Hosting

You can host the application on platforms like [Netlify](https://www.netlify.com/?attr=homepage-modal), which is free to use. Further hosting instructions will be provided later.

---

By following these steps, you will be able to set up the necessary authentication and permissions for your Google Spreadsheet to be accessible by the app, enabling full integration for your expense tracking application.
