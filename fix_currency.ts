import fs from 'fs';
const files = [
  'src/components/AdminViews.tsx',
  'src/components/SubmitReportForms.tsx'
];
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Be careful not to replace `${` which is template literal syntax
  // Split by `${`, replace `$` in pieces
  const pieces = content.split('${');
  for (let i = 0; i < pieces.length; i++) {
    pieces[i] = pieces[i].replace(/\$/g, '₹');
  }
  content = pieces.join('${');
  fs.writeFileSync(file, content);
});
console.log('Currency replaced');
