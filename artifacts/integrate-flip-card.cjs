const fs=require('fs');
const text=fs.readFileSync('C:/Users/xfcha/.codex/attachments/e1acb530-3554-436a-a8ee-ddf521ec6a33/Pasted text.txt','utf8');
const source=text.split('### Full Component Source')[1].match(/```jsx\r?\n([\s\S]*?)\r?\n```/)[1];
const css=text.split('### Component CSS')[1].match(/```css\r?\n([\s\S]*?)\r?\n```/)[1];
fs.writeFileSync('src/components/FlipCard.jsx',source.replace("const span = dragDistance > 0 ? dragDistance : axis === 'x' ? height : width;", "const bounds = rootRef.current.getBoundingClientRect();\n      const span = dragDistance > 0 ? dragDistance : axis === 'x' ? bounds.height : bounds.width;").replace('flip(true)','flip(false)'));
fs.writeFileSync('src/components/FlipCard.css',css);
