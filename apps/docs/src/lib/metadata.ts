import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: 'Promptsmith - Type-Safe System Prompt Builder for AI Agents',
    template: '%s | Promptsmith',
  },

  description: 'Build production-ready system prompts with a fluent, chainable API. Type-safe, secure, and optimized for AI SDK integration.',
  
  keywords: [
    'system prompts',
    'AI prompts',
    'prompt engineering',
    'TypeScript',
    'AI SDK',
    'prompt builder',
    'Vercel AI SDK',
    'OpenAI',
    'Claude',
    'GPT-4',
    'chatbot development',
    'LLM prompts',
  ],

  authors: [{ name: 'Valentin Galfre' }],
  creator: 'Valentin Galfre',
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://promptsmith.galfrevn.com/',
    title: 'Promptsmith - Type-Safe System Prompt Builder',
    description: 'Build production-ready system prompts with type safety and security built-in.',
    siteName: 'Promptsmith',
  },

  twitter: {
    card: 'summary',
    title: 'Promptsmith - Type-Safe Prompt Builder',
    description: 'Build production-ready AI prompts with type safety and security.',
    creator: '@galfrevn',
  },

  icons: {
    icon: '/promptsmith.svg',
  },
};