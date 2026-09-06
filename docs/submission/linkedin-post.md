# LinkedIn Post Draft

I built TankFit AI for the Jornada de Dados sales-agent challenge.

TankFit AI is an end-to-end AI-assisted sales experience for Tankroy Systems Inc., an entirely fictional remote tank-monitoring company. A visitor can describe an operational need in natural language, review structured requirements, receive a compatible product recommendation, inspect a transparent ROI estimate, create a fictional order, complete Stripe test Checkout, switch to a session-scoped sales review, approve the pilot, and download a clearly marked demo proposal.

The central engineering rule is simple: the language model decides what to say; deterministic code decides what can happen.

That boundary keeps compatibility, product facts, price, stock, lead time, ROI arithmetic, payment status, approval, and proposal eligibility outside the model's authority. The application also includes provider fallback, anonymous session isolation, audit events, cost controls, Postgres transactions, signed Stripe webhooks, CI, CodeQL, unit tests, integration tests, and Playwright coverage.

The stack is TypeScript, Next.js, React, Vercel, Neon Postgres, Stripe sandbox, and a server-side AI fallback chain across Gemini, Cerebras, Groq, OpenRouter, and deterministic guided mode.

Every company, person, product, specification, price, transaction, and document shown in the project is fictional and synthetic. This is an independent personal portfolio project created exclusively for the competition.

Try the public demo: https://tankfit-ai.vercel.app/

Explore the code and engineering decisions: https://github.com/davicanada/tankfit-ai

#AIEngineering #TypeScript #NextJS #PostgreSQL #Stripe #Vercel #PortfolioProject #JornadaDeDados

Before publishing, add one or two screenshots and tag the official Jornada de Dados page if desired. After publishing, copy the clean post URL without tracking query parameters into `docs/submission/project-card.md`.
