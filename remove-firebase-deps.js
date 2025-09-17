const fs = require('fs');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

// Remove Firebase dependencies
const firebaseDeps = [
  'firebase',
  'firebase-admin',
  'firebase-functions',
  '@genkit-ai/firebase'
];

// Remove from dependencies
firebaseDeps.forEach(dep => {
  if (packageJson.dependencies && packageJson.dependencies[dep]) {
    delete packageJson.dependencies[dep];
    console.log(`Removed ${dep} from dependencies`);
  }
});

// Write back to package.json
fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
console.log('Firebase dependencies removed from package.json');