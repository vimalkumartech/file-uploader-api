# Next.js Azure Blob Storage file upload with stream

This is a Next.js API route that facilitates file uploads from the client-side and stores them in Azure Blob Storage. It uses the `multer` library to handle multipart/form-data and streams files directly to a specified Azure Blob Storage container.

## Features

- Upload multiple files at once.
- Stream files directly from memory to Azure Blob Storage.
- Environment variables for Azure account configuration.
- Customizable file size and type constraints.
- Progress tracking on file uploads (client-side feature).

## Prerequisites

Before you get started, make sure you have the following:
- Node.js (v12 or higher recommended)
- An Azure Storage account with access keys.
- An Azure Blob Container created in your Storage account.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-github-username/your-repo-name.git
cd file-uploader-api
```
2. Install NPM packages:
```bash
npm install
```
3. Create a `.env.local` file in the root of your project and populate with configurations from `.env.example`.

### Running the project
After installation, you can start the development server:
```bash
npm run dev
```
Open `http://localhost:3000` with your browser to see the file uploader component where you can upload files to azure blob storage.

### API Reference
#### POST /api/upload
Accepts a multipart/form-data request with a field named files which should contain the files to be uploaded.

