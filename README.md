## Spreadsheet expense tracker

This app uses google spreadsheet as a database for tracking expanses.
See the full backend setup here: [How to Use Google Sheets As a Database For Your Business](https://blog.coupler.io/how-to-use-google-sheets-as-database/#Use_Google_Sheets_as_a_database_for_a_website)

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

### Setup spreadsheet

#### Organising your spreadsheet

1. Your google sheet should have a sheet called "Data" where all your expense categories are listed in column A. You can add background color of category in column B. Make this your first sheet.

<img width="306" alt="image" src="https://github.com/MarkoIvanetic/spreadsheet-expense-tracker/assets/9166755/42cb4381-c0e0-43a5-aeb9-49b5cd4d6599">


2. You will need to manually add sheets for every (new) months. App will record the expenses into the last sheet. By default, the app will enter the expanse into range `A:C` with category/value/description data.

You can change this behaviour by altering `sheetRange` variable in `src/pages/api/track.ts`.

#### Authentication

Follow the steps described in [How to Use Google Sheets As a Database For Your Business#Auth](https://blog.coupler.io/how-to-use-google-sheets-as-database/#Use_Google_Sheets_as_a_database_for_a_website:~:text=and%20write%20data.-,Authenticating%20with%20Google%20Sheets%20API,-In%20order%20to)

- Google API service should create a **service account email**. Share the spreadsheet with this email!
- following the step further you will create Service Key. The dashboard will download `client_secret.json`
- only thing you need from here is `client_email` and `private_key`

  Make an `.env` file in the project root:

```
CLIENT_EMAIL=*************@test-api-project-**************************.com
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...Ggg=\n-----END PRIVATE KEY-----\n"
SPREADSHEET_ID="1m4qUwDiD*****************b9SWogQ0_QWyVssyw0"
```

You can easily get spreadsheet Id from the Google sheets URL:

<img width="943" alt="image" src="https://github.com/MarkoIvanetic/spreadsheet-expense-tracker/assets/9166755/4f3bec15-228b-47fe-bb78-dba124d7467b">

#### Hosting

TBA, but I'm using [Netlify](https://www.netlify.com/?attr=homepage-modal) - it's free.
