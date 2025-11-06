"use client";

import { motion } from "motion/react";

const links = [
  {
    id: 1,
    text: "NPM",
    href: "https://www.npmjs.com/package/promptsmith-ts",
  },
  {
    id: 2,
    text: "Githbub",
    href: "https://github.com/galfrevn/promptsmith",
  },
  {
    id: 3,
    text: "X",
    href: "https://x.com/galfrevn",
  },
];

const Footer = () => (
  <motion.footer
    className="flex justify-between border-muted border-t bg-black px-12 py-6"
    initial={{ opacity: 0 }}
    transition={{ duration: 1, type: "spring", delay: 0.25 }}
    viewport={{ once: true }}
    whileInView={{ opacity: 1 }}
  >
    <p className="text-muted-foreground text-sm">
      {" "}
      &copy; {new Date().getFullYear()} Promptsmith. All rights reserved.
    </p>
    <ul className="flex items-center gap-6">
      {links.map((link) => (
        <li
          className="transition-colors duration-200 hover:text-muted-foreground"
          key={link.id}
        >
          <a href={link.href} target="_blank">
            {link.text}
          </a>
        </li>
      ))}
    </ul>
  </motion.footer>
);

export default Footer;
