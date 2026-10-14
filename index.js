// IMPORT: brings in the app we built and exported in app.js ("./" means same folder)
import app from './app.js';

// PORT: the door the server listens on. Uses the PORT from the environment (Render sets one), otherwise 5001
const PORT = process.env.PORT || 5001;

// START: tells the app to begin listening for requests on that port
app.listen(PORT, () => {
  // LOG: prints a message in the terminal so we know the server started and where to open it
  console.log(`ShopCore API running on http://localhost:${PORT}`);
}); // end of the start call
