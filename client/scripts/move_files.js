const fs = require('fs');
const path = require('path');
const base = 'd:/Coder/Github/ERICSS/fullstack-portfolio/src/components/modules/home/components';
const dirs = ['about', 'blog', 'contact', 'education', 'experience', 'projects', 'hero', 'navbar', 'skills', 'tech-stack', 'testimonials'];

dirs.forEach(d => {
  const dirPath = path.join(base, d);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

const filesToMove = [
  { file: 'home-about-section.tsx', dir: 'about' },
  { file: 'home-blog-preview.tsx', dir: 'blog' },
  { file: 'home-contact-section.tsx', dir: 'contact' },
  { file: 'home-education-section.tsx', dir: 'education' },
  { file: 'home-experience-section.tsx', dir: 'experience' },
  { file: 'home-featured-projects.tsx', dir: 'projects' },
  { file: 'home-hero-section.tsx', dir: 'hero' },
  { file: 'home-navbar.tsx', dir: 'navbar' },
  { file: 'home-skills-section.tsx', dir: 'skills' },
  { file: 'home-tech-stack.tsx', dir: 'tech-stack' },
  { file: 'home-testimonials.tsx', dir: 'testimonials' },
];

filesToMove.forEach(item => {
  const src = path.join(base, item.file);
  const dest = path.join(base, item.dir, item.file);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${item.file} to ${item.dir}`);
  }
});
