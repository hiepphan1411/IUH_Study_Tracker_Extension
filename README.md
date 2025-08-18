# IUH Study Tracker Extension

![Logo](public/icon128.png)

## Overview

IUH Study Tracker is a browser extension designed specifically for students at Industrial University of Ho Chi Minh City (IUH). It helps students track their academic progress, view schedules, and access grades more conveniently without repeatedly logging into the university portal.

## Features

- **Schedule Viewing**: Easily access your class schedule with a single click
- **Grade Tracking**: View your academic results and track your progress
- **User-friendly Interface**: Clean, modern UI designed for ease of use
- **Quick Access**: Save time by avoiding repeated logins to the university portal
- **Secure Access**: Uses the university's official API with your personal access key

## Installation

### Chrome Web Store (Recommended)
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore) and search for "IUH Study Tracker"
2. Click "Add to Chrome" and follow the prompts

### Manual Installation
1. Download the latest release from this repository
2. Unzip the downloaded file
3. Open Chrome and navigate to `chrome://extensions`
4. Enable "Developer Mode" in the top right
5. Click "Load Unpacked" and select the unzipped folder
6. The extension should now appear in your browser toolbar

## Getting Started

1. Click on the IUH Study Tracker icon in your browser toolbar
2. Follow the instructions to obtain your access key (see "How to Get Your Access Key" section)
3. Enter your access key in the extension
4. You can now view your schedule and grades with a single click!

## How to Get Your Access Key

To use the extension, you'll need to obtain an access key from the IUH student portal:

1. **Access the IUH Student Portal**
   - Open your web browser
   - Navigate to [https://sv.iuh.edu.vn/sinh-vien-dang-nhap.html](https://sv.iuh.edu.vn/sinh-vien-dang-nhap.html)
   - Select "Chế độ dành cho phụ huynh"
   - Click "Tra cứu thông tin"

2. **Enter Student Information**
   - Fill in all required information:
     - Student ID
     - Full name
     - Date of birth (dd/mm/yyyy)
     - Registered phone number
     - CAPTCHA code

3. **View Academic Results**
   - After entering correct information, the system will show search results
   - Select "Xem điểm" to continue
   - The system will redirect you to the academic results page

4. **Copy the Key from URL**
   - Look at your browser's address bar
   - Find the URL with the format: `https://sv.iuh.edu.vn/tra-cuu/ket-qua-hoc-tap.html?k=XXXX`
   - Copy the string after "k=" (Example: `8k_Zf30Gv5L81suIlYeau3pKsgdRG`)
   - This is your access key

5. **Enter the Key in Extension**
   - Paste the copied key into the extension's input field
   - You're all set!

## Important Notes

- Never share your access key with others
- If you can't access your information, make sure your phone number is updated in the university system
- The extension only works with official IUH student portal URLs

## Development

### Tech Stack
- React + Vite
- Tailwind CSS for styling
- Chrome Extension APIs

### Project Structure
### Project Structure  
├── public/ # Static assets and extension files <br>
│ <br>
├── background.js # Background script for extension <br>
│ <br>
├── contentScript.js # Content script for page interaction <br>
│ <br>
├── manifest.json # Extension manifest file <br>
│ <br>
└── ... # Icons and other assets <br>
├── src/ # Source code <br>
│ <br>
├── components/ # React components <br>
│ <br>
├── layout/ # Layout components <br>
│ <br>
├── templates/ # HTML templates <br>
│ <br>
├── utils/ # Utility functions <br>
│ <br>
├── App.jsx # Main application component <br>
│ <br>
└── ... # Other source files <br>
└── ... # Configuration files  

###Load the built extension in Chrome:
- Go to `chrome://extensions/`
- Enable Developer mode
- Click "Load unpacked"
- Select the `dist` folder
## Privacy

This extension:
- Does not collect or store your personal information
- Only uses your access key to retrieve data from the official IUH portal
- Does not share any data with third parties
- All processing happens locally in your browser
## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Contact

If you have any issues or need support, please contact us through:

- Email: hgnd27811.dev@gmail.com

## Acknowledgements: All contributors who have helped develop this extension
