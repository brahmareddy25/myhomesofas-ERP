const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src', 'app')).concat(walk(path.join(__dirname, 'src', 'components')));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  if (content.includes('alert(')) {
    if (!content.includes('import toast') && !content.includes('import { toast }')) {
       const lines = content.split('\n');
       let insertIdx = 0;
       for(let i=0; i<lines.length; i++){
          if(lines[i].startsWith('import ')) {
             insertIdx = i;
          } else if(lines[i].trim() === '' && insertIdx > 0) {
             break;
          }
       }
       lines.splice(insertIdx + 1, 0, "import toast from 'react-hot-toast';");
       content = lines.join('\n');
    }
    
    const lines = content.split('\n');
    for(let i=0; i<lines.length; i++) {
       if (lines[i].includes('alert(')) {
          if (lines[i].toLowerCase().includes('error') || lines[i].toLowerCase().includes('fail') || lines[i].toLowerCase().includes('please') || lines[i].toLowerCase().includes('invalid') || lines[i].toLowerCase().includes('exceeds')) {
             lines[i] = lines[i].replace(/alert\(/g, 'toast.error(');
          } else {
             lines[i] = lines[i].replace(/alert\(/g, 'toast.success(');
          }
       }
    }
    content = lines.join('\n');
    
    if (content !== originalContent) {
       fs.writeFileSync(file, content, 'utf8');
       console.log('Updated: ' + file);
    }
  }
});
console.log('Done');
