
# Web Extension for Bug and Feedback Reporting

This repository contains a web extension developed during a hackathon. The extension allows customers and users to report bugs and provide feedback directly through the browser.

## Features

- **Feedback Submission**: Users can submit feedback and bug reports via the extension.
- **Data Processing**: Feedback is sent to an external URL (utilizing Zapier).
- **Automation**: Feedback is processed by GPT and sent to relevant Slack channels for further action.

## How to Use

1. Download the repository, build it, and get the final extension fiels from the /dist folder.
2. Install the extension in your browser.
3. Click the extension icon to open the feedback form.
4. Fill out the form with your feedback or bug report.
5. Submit the form.

## Running Locally

### Setup

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Create and Activate Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scriptsctivate
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Build the Extension**:
   ```bash
   npm run build
   ```

5. **Load Extension in Chrome**:
   - Open `chrome://extensions/`.
   - Enable "Developer mode".
   - Click "Load unpacked" and select the `dist` directory.

## Configuration Notes

- The extension is currently set up to run with Lusha configurations. To customize for your own use:
  1. **Update the Site URL**: Edit the `manifest.json` file and update the `permissions` and `matches` fields with your own site URL.
  2. **Set Up Environment Variables**: Replace the existing secret in your `.env` file with your own URL.
  3. **Modify External URL**: Ensure the external URL in the `background.ts` file points to your own endpoint instead of the default Zapier URL.

## Contributing

Feel free to fork this repository and submit pull requests. For major changes, please open an issue to discuss what you would like to change.

## License

This project is licensed under the MIT License.
