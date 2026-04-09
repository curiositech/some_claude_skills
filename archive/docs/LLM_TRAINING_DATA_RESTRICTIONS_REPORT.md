# LLM Training Data Restrictions, Limitations, and Ethical Considerations
## Comprehensive Research Report (2024-2025)

**Research Date:** January 16, 2026
**Coverage Period:** 2024-2025
**Researcher:** Claude Code (Anthropic)

---

## Executive Summary

This report provides a comprehensive analysis of restrictions, limitations, and ethical considerations surrounding LLM training data across major AI companies. Key findings include:

- **Universal CSAM filtering** has become standard, though datasets used for moderation tools have been found to contain CSAM
- **Copyright litigation** is reshaping industry practices, with mixed fair use rulings and billion-dollar settlements
- **Data licensing deals** have emerged as a major revenue stream, with Reddit earning $203M and Shutterstock generating $104M in 2023
- **Synthetic data** is increasingly used but poses model collapse risks when not mixed with human-generated content
- **Web scraping restrictions** are intensifying, with 70% more sites blocking AI crawlers in 2025 compared to early 2024
- **Cultural and linguistic bias** remains a critical concern, with Western-centric perspectives dominating training data
- **User data policies** are diverging, with some companies now requiring opt-out by default (Anthropic, xAI) while others maintain opt-in approaches

---

## 1. Self-Imposed Restrictions by Company

### 1.1 Anthropic

**Constitutional AI Approach:**
- Uses a set of principles to guide models to avoid toxic, discriminatory outputs and prevent assistance with illegal or unethical activities [Anthropic Constitutional AI]
- Implements "Collective Constitutional AI" incorporating public input into alignment [Anthropic Research]
- Constitutional framework is the primary mechanism, with human oversight provided only through a list of rules or principles

**Responsible Scaling Policy (RSP):**
- Version 2.2 became effective May 14, 2025
- Public commitment not to train or deploy models capable of catastrophic harm unless safety and security measures are implemented [Anthropic RSP]

**Major Data Policy Changes (2025):**
- **September 2025 update** required all Claude users to decide by October 8, 2025, whether their conversations could be used for training [TechCrunch]
- Data retention expanded to **five years** for users who opt-in, versus 30 days for opt-out
- Policy **does not affect** enterprise, education, or government customers—their data remains excluded from training
- Prior to this update, Anthropic did not use user conversations to train Claude unless users submitted feedback

**Training Data Freshness:**
- Claude Sonnet 4: trained on data up to **March 2025**
- Claude Haiku 3.5: trained on data up to **July 2024**

### 1.2 OpenAI

**Model Specification Updates:**
- Released updated Model Spec (December 18, 2025) outlining alignment principles [OpenAI Model Spec]
- Production models don't yet fully reflect these guidelines

**Usage Policy Evolution:**
- **January 2025:** Updated Universal Policies to clarify prohibitions under applicable laws
- **January 2024:** Updated Usage Policies to provide clearer service-specific guidance [Baker Donelson]

**Data Retention Policy:**
- **Pivotal 2024 change:** Removed ability for free and Plus users to disable chat history—all prompts retained indefinitely unless manually deleted [Nightfall AI]
- Enterprise and Team subscribers retain opt-out capability with 30-day data purging
- Zero Data Retention option available for eligible enterprise API endpoints

**Training Data Usage:**
- By default, retains API inputs/outputs for up to 30 days for abuse monitoring
- Business/enterprise customers: **Do not train** models on customer API or enterprise data by default [OpenAI Enterprise Privacy]
- Consumer ChatGPT has separate controls allowing training on user data

**Training Data Sources and Cutoffs:**
- GPT-4o: knowledge cutoff **June 2024** (extended from November 2023)
- GPT-5: knowledge cutoff **September-October 2024** (sources vary; some report August 2025)
- Categories disclosed: internet, licensed, and human-provided data—but not specific datasets or proportions [TTMS]

**Transparency Concerns:**
- Public communications about GPT-5 training data have been "high-level and non-quantitative"
- System cards focus more on capabilities and safety than training methodology

### 1.3 Google DeepMind

**Responsible AI Framework:**
- Among first organizations to publish AI principles (2018) and annual transparency reports (since 2019) [Google Responsible AI Report]
- Framework applied in safety and governance processes for frontier models like Gemini 2.0
- Updated Frontier Safety Framework published early 2025 with recommendations for heightened security and deployment mitigations

**Training Data Governance:**
- Focus on filtering training data for quality
- Model documentation requirements and data lineage tracking outlined in February 2025 Responsible AI Progress Report [Google AI Responsibility Update]

**Safety Commitments and Controversies:**
- At February 2024 UK-South Korea summit, Google promised to publicly report model capabilities and risk assessments
- **Violation incident:** In March 2025, released Gemini 2.5 Pro **without model card**, prompting 60 UK lawmakers to accuse Google DeepMind of violating Frontier AI Safety Commitments [Fortune]
- Google defended its "transparent testing and reporting processes," noting models undergo rigorous safety checks including by UK AISI and third-party testers

### 1.4 Meta

**Open-Weights Approach:**
- Llama models released with open model weights but **limited disclosure** of training data
- Meta disagrees with Open Source Initiative's October 2024 definition requiring detailed training data disclosure [Llama Wikipedia]

**Training Data Disclosure:**
- Llama 3 pre-trained on approximately **15 trillion tokens** from "publicly available sources"
- Specific datasets and sources remain undisclosed [Kili Technology]

**License Restrictions:**
- **Llama 2/3 license:** Restricts using any part of Llama models or outputs to train another AI model
- Companies with **over 700 million monthly active users** need special permission
- **EU restriction:** Llama 3.2, 3.3, and 4 AUPs restrict rights for EU-based companies and individuals [Skywork AI]

**Free Software Classification:**
- Free Software Foundation classified Llama 3.1's license as **nonfree** (January 2025) due to:
  - Acceptable use policy restrictions
  - Restrictions against users with popular applications
  - Enforcement of trade regulations outside user's jurisdiction [Wikipedia]

**Current Status:**
- Llama 4 released under Llama 4 Community License enabling broad building while retaining license controls

### 1.5 Mistral AI

**European Values Approach:**
- Developed in France with emphasis on **privacy, transparency, and sovereignty**
- Designed to ensure advanced AI serves European values and contributes to digital sovereignty [Mistral AI Guide]

**Training Data:**
- 7B model trained on web data; specific providers maintain confidentiality considering it competitive edge [DataNorth AI]
- Trains models in Italian, French, and Spanish but needs access to large volumes of data in those languages to ensure relevance

**Regulatory Alignment:**
- Signatory to EU's General-Purpose AI Code of Practice (July 10, 2025) [Jones Day]
- Committed to implementing copyright compliance measures and identifying/removing content with reserved rights

**Infrastructure Concerns:**
- Warned in June 2024 of lack of data centers and training capacity in Europe, potentially limiting development [Euronews]

### 1.6 xAI (Grok)

**Data Filtering and Restrictions:**
- Applies quality filters to **remove violent content** before using training data [xAI FAQ]
- Training data may incidentally include publicly available personal information about public figures
- Takes steps to minimize processing of personal and sensitive data for training
- Does **not** actively seek out personal information to build profiles
- Does **not** process training data for inferring sensitive or special category data

**User Data Collection (2024):**
- **November 15, 2024:** X (Twitter) updated Terms of Service to use user posts, text, and interactions to train Grok
- **July 2024:** Changed settings to use user data for Grok training **by default**—users must manually opt out [TechCrunch Grok]

**Third-Party Training Restrictions (2025):**
- X updated developer agreement to restrict developers from using X content or API to "fine-tune or train a foundation or frontier model"
- X's own terms of service still allow it to use user data for training [The Outpost AI]

**Terms of Service Update (January 2026):**
- Effective January 15, 2026, X will treat AI-era interactions as "Content" including "inputs, prompts, outputs"
- Users grant X worldwide, royalty-free, sublicensable license to use content "for any purpose" including AI training [CryptoSlate]
- Anti-scraping rules maintained with **liquidated damages of $15,000 per 1M posts** accessed in violation
- New "misuse" clause targets AI circumvention including jailbreaking and prompt injection

**Privacy and Sensitive Data:**
- In relation to Grok training, does not process data for inferring sensitive or special category data about individuals

---

## 2. Content Type Restrictions

### 2.1 CSAM Filtering (Universal)

**Detection and Prevention:**
- All major AI companies maintain **zero tolerance** policies for CSAM
- Systems detect both input prompts intended to produce AI-generated CSAM (AIG-CSAM) and CSEM in outputs
- Priority on **recall over precision**—accepting false positives to catch harmful content [Thorn Safety by Design]

**Challenges and Incidents:**
- **February 2025:** Canadian child protection charity found CSAM and exploitation images in dataset used for developing AI moderation tools [Protect Children Canada]
- Highlights critical concerns about presence of harmful content in datasets used to train moderation systems

**Moderation Approaches:**
- Meta AI released **Llama-Guard** series for classifying LLM inputs/outputs for policy violations
- Latest version (Llama-Guard 3 8B) is multi-modal and multi-lingual, aligned with standardized hazard taxonomy [Ensuring LLM Outputs]
- Keyword filters face challenges: can conflate harmful intent with educational content
- Over-aggressive removal may inadvertently amplify toxicity in model outputs [Evaluation of LLM Safety Systems]

### 2.2 Violence and Harmful Content

**Platform-Specific Policies:**

**Google Gemini:**
- Prohibits generating outputs depicting "sensational, shocking, or gratuitous violence"
- Bans content that "incites violence, makes malicious attacks, or constitutes bullying or threats" [Gemini Policy Guidelines]
- Generative AI Prohibited Use Policy explicitly bans "violence or the incitement of violence" [Google Prohibited Use Policy]

**Recent Legislation (2024-2025):**
- **TAKE IT DOWN Act (late spring 2025):** First federal law to limit AI use in ways harmful to individuals [NCSL AI Legislation]
- **GUARD Act of 2025:** Would criminalize making AI companions available to minors that "encourage suicide, self-harm, or imminent physical or sexual violence" [Crowell & Moring]
- State laws prohibit AI use encouraging "self-harm, violence, or criminality" and "creation or distribution of AI-generated CSAM"

**EU AI Act Requirements (August 2025):**
- Developers need "detailed technical documentation (down to training data sources)"
- Copyright compliance policies required [King & Spalding]

**Workplace Safety Concerns:**
- **Schuster v. Scale AI lawsuit:** Alleges AI training workers required to "input and monitor psychologically harmful information" including content about "suicidal ideation, predation, child sexual assault, violence" [Epstein Becker Green]

### 2.3 Personal/Private Information (PII)

**Privacy Risks:**
- LLMs capable of **memorizing and reproducing** complete sets of training data, including PII if prompted correctly [Frontiers PII Privacy]
- Research demonstrates extraction of training data from production LLMs via carefully crafted prompts

**Dynamic Privacy Concerns (2025):**
- Adding PII can **increase memorization** of other PII by up to **7.5 times**
- Removing PII can paradoxically lead to other PII being memorized [ArXiv Privacy Ripple Effects]

**Training Data Concerns:**
- Training involves vast datasets containing sensitive information: PII, intellectual property, financial records
- Risks include web-scraped PII, lack of data minimization, and copyright overlap [Sigma AI]

**Protection Strategies:**
- **Pre-training:** Remove obvious PII from training corpora; perform thorough data deduplication to reduce memorization
- **De-identification:** Safe Harbor (removing 18 identifiers) or Expert Determination for PHI [Sigma AI]
- **Technical protections:** De-identification, differential privacy, synthetic data as input privacy protections [Frontiers]

**Regulatory Framework:**
- GDPR, HIPAA, and PCI-DSS now expect AI systems to have **auditable, runtime controls** for sensitive data
- Organizations can face penalties without a breach, simply for storing regulated data in unapproved locations [Protecto AI]

**Ongoing Challenges:**
- Even if sensitive information later removed from training dataset, **impossible to remove influence** without significantly reducing model performance
- User prompts containing private information may leak to other users when LLMs use input as training data [Privacy and Data Protection Risks]

**Secret Leakage:**
- **23.77 million secrets** leaked through AI systems in 2024 alone—25% increase from previous year [Check Point AI Security Report]

### 2.4 Copyrighted Content

**Major Legal Developments:**

**U.S. Copyright Office Guidance (May 2025):**
- Released 108-page report concluding "it is not possible to prejudge litigation outcomes"
- Stated "some uses of copyrighted works for generative AI training will qualify as fair use, and some will not" [Skadden Copyright Office]

**Key Court Decisions (2025):**

**Bartz v. Anthropic (June 2025):**
- Judge found AI training process **highly "transformative"** supporting fair use
- Purpose of training was to teach Claude to generate new text—not reproduce book content
- However, acquisition of libraries of stolen books was **not fair use**
- **Settlement:** Anthropic agreed to pay **up to $1.5 billion** [Ropes & Gray Fair Use]

**Kadrey v. Meta (June 2025):**
- Judge held training LLM on copyrighted books (including from shadow libraries) was **fair use on the record**
- Judge stated "in most cases," training LLMs on copyrighted works without permission is **likely infringing and not fair use** [Ropes & Gray]

**Thomson Reuters v. ROSS Intelligence (February 2025):**
- Court granted summary judgment for Thomson Reuters, rejecting all copyright defenses including fair use
- Use was **not transformative** and could harm both original and derivative markets [IPWatchdog AI Copyright]

**Ongoing Litigation:**
- Dozens of cases pending against AI developers for using copyrighted works to train models
- Notable plaintiffs: The New York Times, Authors Guild, music companies, major record labels (filed 2023-2024) [ACC Fair Use]

**Researchers and Paywalled Content:**
- 2025 AI Disclosures Project paper concluded OpenAI **likely trained GPT-4o** on paywalled O'Reilly Media books despite no licensing agreement [TechCrunch O'Reilly]
- ChatGPT 4 mini (free) only trained on open, non-paywalled web through October 2023
- AI tools without library database access cannot fully substitute for human researchers [Gateway Technical College]

**AI Bypassing Paywalls:**
- ChatGPT and other AI chatbots bypass paywalls through "live" web search
- Professionals ask AI to "recreate the argument" of locked journal articles
- AI pulls from abstracts, citations, previous papers, and commentary to assemble convincing versions [Digital Digging]

### 2.5 Medical/Legal Advice

**Medical AI Liability:**
- When AI systems produce incorrect medical recommendations due to poor data quality, flawed training, or algorithm design, **liability lines become blurred**
- Fault may lie with developers/trainers if algorithm trained on **biased or insufficient data** [MedCentral Legal Risks]

**Liability Statistics:**
- **2024 data:** 14% increase in malpractice claims involving AI tools compared to 2022
- Majority stemming from diagnostic AI in radiology, cardiology, and oncology [Brandon J Broderick]

**Liability Distribution:**
- Medical professionals potentially liable if they misuse AI tools
- Software developers historically avoided malpractice liability, but plaintiffs increasingly filing **product liability claims** against developers whose AI systems malfunction or misdiagnose [Miami Law Review]

**Training Data Issues:**
- Algorithm training on biased or insufficient data that doesn't generalize to broader patient populations can lead to liability for developers and trainers [Bio-Conferences]

**Regulatory Framework:**
- **January 2024:** Office of the National Coordinator for Health Information Technology issued final rule creating new regulatory framework for AI developers of certified health IT
- Effective **July 5, 2024** [Holistic AI Healthcare Laws]

**AMA Recommendations:**
- Align liability with those best positioned to know AI system risks and mitigate harm through design, development, and implementation
- Mandated AI use should assign liability to entity issuing the mandate [The Doctors Advocate]

### 2.6 Malware and Exploit Code

**Major AI Security Threats (2024-2025):**

**Malicious Code Incidents:**
- **December 2024:** Ultralytics AI library compromised, installing malicious code for cryptocurrency mining [Fortune AI Coding Tools]
- **August 2025:** Malicious Nx packages used AI assistants (Claude Code, Google Gemini CLI) to enumerate and exfiltrate secrets [BlackFog AI Vulnerabilities]

**Dark LLMs:**
- Emergence of HackerGPT Lite, WormGPT, GhostGPT, and FraudGPT
- Created by jailbreaking ethical AI systems or modifying open-source models like DeepSeek
- Specifically designed to bypass safety controls
- Marketed on dark web forums [WAITS on AI Cybersecurity]

**Training Data Vulnerabilities:**
- **Russian disinformation network "Pravda":** Created around **3.6 million articles** in 2024 to influence AI chatbot responses
- Research shows chatbots echoed Pravda's false narratives **33% of the time** [IBM Offensive AI]

**Code Security Issues:**
- **2025:** Critical vulnerabilities discovered in AI coding tools from Cursor, GitHub, and Google's Gemini leaving door open to **prompt injection attacks** [Fortune]
- **CrowdStrike observation:** Threat actors exploiting unauthenticated code injection vulnerability in Langflow AI to gain credentials and deploy malware [Trend Micro]
- **CVE-2025-32711:** Affected Microsoft 365 Copilot with CVSS score of **9.3**—AI command injection could allow attackers to steal sensitive data [HackerNews Traditional Security]

**Security Restrictions and Challenges:**
- Major labs placing tighter restrictions on model outputs and limiting release of advanced capabilities
- Sophisticated threat actors increasingly turning to **privately trained, forked, or fully closed systems** operating outside traditional oversight [IBM Offensive AI]

**Scale of Impact:**
- **Sysdig research:** 500% surge in cloud workloads containing AI/ML packages in 2024 [DeepStrike AI Cybersecurity]
- **80% of ransomware attacks** now use artificial intelligence [IntelligenceX AI Ransomware]

---

## 3. Licensing Agreements

### 3.1 Reddit Licensing Deals

**Major Partnerships:**

**Google Deal (2024):**
- Valued at **$60 million annually** to train Google's Vertex AI on Reddit data [CJR Reddit AI]

**OpenAI Deal (2024-2025):**
- Estimated at **$70 million per year**
- Provides access to real-time, structured content from Reddit
- Allows OpenAI tools/models to better understand and showcase Reddit content [TechCrunch OpenAI Reddit]

**Total Contract Value:**
- Reddit disclosed licensing agreements with Google, OpenAI, and others worth **$203 million** in 2024 [TechCrunch Reddit Data]

**Reddit's New Negotiation Strategy:**

**Dynamic Pricing Model:**
- Reddit proposing **variable compensation** that increases as its content becomes more integral to AI-generated outputs [Media and the Machine]

**Integration Requirements:**
- Pushing for deeper integration into Google's AI products
- Wants structure encouraging users to contribute more to forums
- Seeking Google search traffic to feed back into Reddit communities

**Enforcement Actions:**
- Updated to **block most automated crawlers**, requiring AI companies to secure licensing agreements
- **Sued Anthropic** for allegedly scraping the site over 100,000 times [Best Lawyers Reddit Lawsuit]

### 3.2 News Organization Partnerships

**The New York Times:**
- **May 2025:** First AI licensing agreement with Amazon—multi-year deal
- Amazon pays **$20-25 million annually** for right to license NYT content for AI training and Alexa product responses [eWeek Amazon NYT]
- **2024:** Federal judge allowed lawsuit against OpenAI and Microsoft to proceed, alleging use of copyrighted newspaper articles without permission [Press Gazette]

**Associated Press:**
- **July 2023:** Two-year agreement with OpenAI providing access to AP news archive (dating to 1985) and real-time news coverage [Profound AI Publishers]
- Google signed first AI content licensing deal with AP—AP real-time news appears in Gemini chatbot
- Joined Microsoft's pay-per-use AI content marketplace

**Reuters:**
- Thomson Reuters confirmed licensing news content to train LLMs
- **First news publisher** to sign AI deal with Meta—Meta's AI chatbot uses real-time Reuters content
- Signed on to Microsoft's Copilot Daily feature with payment from Microsoft [Profound Publishers]

**Other Notable Partnerships (2024-2025):**
- **OpenAI + News Corp:** Deal worth **over $250 million over five years**
- **OpenAI + Business Insider/Axel Springer** (Politico owner): **$25-30 million** [Digiday Timeline]
- **Washington Post + OpenAI (April 2025):** "Strategic partnership" allowing OpenAI to display summaries, quotes, and links to journalism with clear attribution
- **Meta (2025):** Multi-year AI content licensing deals with **seven publishers**—CNN, Fox News, People Inc., USA Today Co.—Meta's first publisher licensing deals [Digiday]

### 3.3 Stock Photo Licensing

**Shutterstock:**
- Deal with OpenAI alone could generate **up to $250 million by 2027** [Stock Photo Secrets]
- **Apple deal:** Paid Shutterstock **$25-50 million** to access vast archive for training AI systems [Inc. Apple Shutterstock]

**Revenue Performance:**
- **2023:** Made **$104 million** from AI licensing [PetaPixel Shutterstock]
- **2024 projection:** $138 million in AI licensing revenue
- **2027 expectation:** $250 million
- **2024 total revenue:** $935 million (up 7% from previous year) with over $100M from licensing image data to generative AI companies [Yahoo Finance Shutterstock]

**Getty Images:**
- Using assets to train proprietary AI tools and licensing to third-party developers
- "Creative" stock segment declined nearly **5% year-on-year in 2024**, offset by gains in editorial and AI data licensing [Foster Fletcher Getty]
- Works with generative AI video company Runway

**Getty-Shutterstock Merger:**
- Boards signed off on full merger announced **January 2025**
- Valued at approximately **$3.7 billion**
- Stated goal: strip out **$150-200 million** in duplicate overhead during first three years [Foster Fletcher]

### 3.4 Academic Dataset Licenses

**Market Overview:**
- Global AI datasets & licensing for academic research and publishing market estimated at **$381.8 million in 2024**
- Projected to reach **$1.59 billion by 2030** (CAGR of 26.8%) [Grand View Research]
- **2024:** Harvard University (with backing from Microsoft and OpenAI) released vast AI training dataset comprising nearly **one million public-domain books** to democratize access [Grand View Research Training]

**License Types:**
- Open-access datasets often have permissive licenses: Creative Commons (CC) or Open Data Commons (ODC)
- Proprietary datasets may require specific agreements
- Institutional licenses segment held **largest market share in 2024 (38%)** [Grand View Research]

**Dataset Licensing Issues:**
- **Nature Machine Intelligence study:** License omission rates of **over 70%** and error rates of **over 50%** on popular dataset hosting sites
- While less than 33% of datasets restrictively licensed, **over 80%** of source content in widely-used text, speech, and video datasets carry **non-commercial restrictions** [Nature Dataset Licensing]

**ArXiv:**
- Uses arXiv.org perpetual non-exclusive license for papers
- Data Provenance Initiative conducted multi-disciplinary audit of **1800+ text datasets**, developing tools to trace lineage [ArXiv Data Provenance]

**LAION Datasets:**
- LAION-5B licensed under **Creative Common CC-BY 4.0** [LAION GitHub]
- **August 2024:** LAION temporarily removed LAION-5B and LAION-400M citing "zero tolerance policy for illegal content" and "abundance of caution"
- Released cleaned dataset **Re-LAION-5B** (around 5.5 billion text-image pairs) under **Apache 2.0 license** [TechCrunch LAION CSAM]
- LAION stresses datasets intended for **research—not commercial—purposes** [LAION]

**Common Crawl:**
- As of 2016, includes copyrighted work and is distributed from US under **fair use claims** [Wikipedia Common Crawl]
- As of 2024, cited in **more than 10,000 academic studies**
- **2024 Mozilla report:** 2/3 of 47 generative LLMs released between 2019-2023 relied on Common Crawl data [Mozilla Foundation Common Crawl]
- Common Crawl could influence AI builders' use by changing Terms of Use or adopting different data license

**Recent Regulatory Developments:**
- **September 2024:** Dataset Providers Alliance (DPA) released comprehensive position paper on AI data licensing [Emergen Research]
- **March 2025:** CCC announced plans to introduce new voluntary, non-exclusive **AI Systems Training License** in late 2025 allowing organizations to legally use copyrighted materials for training AI systems [Nature Dataset Licensing]

---

## 4. Technical Restrictions

### 4.1 Rate Limiting on Web Scraping

**Increased Blocking (2024-2025):**
- About **5.6 million websites** added OpenAI's GPTBot to disallow list in robots.txt file—up from 3.3 million in early July 2025 (**70% increase**) [The Register Publishers]
- ClaudeBot now blocked at about **5.8 million websites**, up from 3.2 million in early July [Publishers]

**Enforcement Challenges:**
- **Q2 2025:** 13.26% of AI bot requests ignored robots.txt directives, up from **3.3% in Q4 2024** [Stytch Block AI]
- Many newer AI scrapers do not respect robots.txt
- **Duke University study (2025):** Several categories of AI-related crawlers **never request robots.txt at all** [Stytch]

**Extreme Crawl-to-Referral Ratios (June 2025):**
- OpenAI: **1,700:1** crawl-to-referral ratio
- Anthropic: **73,000:1** crawl-to-referral ratio
- Contrast: Google crawls websites about **14 times for every referral** [Empirical Study Robots.txt]

**Industry Response:**
- **July 2024:** Cloudflare gave everyone on network simple way to block all AI scrapers with **single click for free** [Cloudflare Control Content]
- AI companies now required to obtain **explicit permission** from website before scraping
- Every new Cloudflare domain asked if they want to allow AI crawlers [Cloudflare Press Release]

**New Standards Under Development:**
- As of late 2025, both **ai.txt and llms.txt** formats are **not yet ready** to become new AI standard for scraping data
- Unlikely to change as early as 2026 [DEV New AI Web Standards]

### 4.2 API Access Restrictions

**X (Twitter) API Restrictions:**
- Updated developer agreement adds new restrictions: developers can't use content from X or API to "fine-tune or train a foundation or frontier model"
- However, X's own terms of service still allow it to use user data to train its models [The Outpost AI]

**Anti-Scraping Enforcement:**
- X maintains strict anti-scraping rules barring crawling or scraping "in any form, for any purpose" without prior written consent
- **Liquidated damages:** $15,000 per 1,000,000 posts requested, viewed, or accessed in any 24-hour period in violation [CryptoSlate X Terms]

**API Provider Restrictions:**
- Many providers (OpenAI, Google) limit how you can store, analyze, or reuse data their tools return
- Some expressly prohibit using outputs for model training or retaining customer data beyond defined window [Traverse Legal]

### 4.3 Paywalled Content Handling

**Training Data Access:**
- **2025 paper (AI Disclosures Project):** OpenAI likely trained GPT-4o on paywalled O'Reilly Media books despite no licensing agreement [TechCrunch O'Reilly]
- ChatGPT 4 mini (free version) only trained on open, non-paywalled web through October 2023
- Many AI tools do not have access to full range or full text of articles behind paywalls [Gateway Technical College]

**AI Bypassing Paywalls:**
- ChatGPT and other AI chatbots bypass paywalls through "live" web search
- Professionals ask AI to "recreate the argument" of locked journal articles
- AI pulls from abstracts, citations, previous papers, and commentary to assemble convincing versions of original content [Digital Digging Paywalls]

**Publisher Response:**
- In 2024, several major publishers blocked AI bots from scraping their sites
- **TollBit report:** Blocked **26 million scraping attempts** in March 2025 alone [Copyleaks Paywalled Content]

**Impact on Open Access:**
- Open access platforms (PLOS, arXiv) adding AI summaries to paper previews
- Makes work more discoverable and shareable [LinkedIn AI Open Access]

### 4.4 Synthetic Data Policies

**Increased Use of Synthetic Data (2024):**
- In 2024, major labs made pre-training pipelines more sophisticated by focusing on **synthetic data**, optimizing data mixes, using domain-specific data, and adding dedicated long-context training stages [Sebastian Raschka State of LLMs]

**Model Collapse Risk:**
- By April 2025, over **74% of newly created webpages** contained AI-generated text—trend accelerates AI model collapse unless training pipelines filter synthetic content [WINN Solutions AI Model Collapse]
- **July 2024 Nature article (Ilia Shumailov et al.):** LLMs degrade when successive generations train on content produced by earlier models—degenerative process called "model collapse"

**Mitigation Strategies:**
- **2024 study:** Model collapse appears when replacing real data with synthetic data each generation
- When accumulating synthetic data **alongside original real data**, models stay stable across sizes and modalities [Sebastian Raschka]
- Challenges can be mitigated by using training data with **greater diversity** or training on **mixture of human-generated and synthetic data** [ArXiv Synthetic Data]

**Privacy Concerns:**
- Enterprise offerings of LLM providers promise **not to train on customer data** and to purge it after a session [Medium Protecto AI Privacy]

**Consensus:**
- Mixing synthetic and human-generated data produces better outcomes than relying solely on synthetic content

---

## 5. Ethical Review Processes

### 5.1 Red Teaming Approaches

**Overview:**
- LLM red teaming is process of detecting vulnerabilities (bias, PII leakage, misinformation) through intentionally adversarial prompts [Confident AI Red Teaming]
- Critical methodology for ensuring ethical integrity by rigorously evaluating biases, robustness, and ethical impacts [Knowledge Management Depot]

**Government & Institutional Initiatives (2024):**
- **SEI researched** three areas of generative AI called out by Office of Director of National Intelligence's Principles of AI Ethics for Intelligence Community:
  - Protecting privacy
  - Mitigating bias
  - Immature security practices [SEI Annual Reviews]

**UK AISI Empirical Investigations:**
- Focus on empirical investigations into AI monitoring and red teaming [AISI UK]

**Training Data Review Processes:**
- Red-teaming a dataset means intentionally stress-testing it the way a regulator, adversary, or edge-case user might
- Reveals biases, blind spots, and brittle cases before training [AI Competence Red Teaming]

**Red-teaming reduces risk by:**
- Identifying systematic biases (e.g., underrepresented dialects, demographics, or regions)
- Detecting distributional gaps that break performance in production
- Surfacing label errors and annotation drift
- Exposing adversarial or safety vulnerabilities before deployment

### 5.2 Bias Auditing in Training Data

**Bias Detection Methods:**
- Analyzing training datasets for representational fairness
- Examining decision-making patterns for unintended disparities
- Employing fairness metrics to evaluate model outcomes [Knowledge Management Depot]

**Red Team Bias Probing:**
- Statistical analysis to check for parity across different groups
- Using explainable AI (XAI) to analyze model decision-making procedures
- Applying bias detection tools and libraries
- Monitoring and auditing model output [Mindgard AI Red Teaming]

**Auditing Frameworks:**
- Auditors must ensure datasets are **diverse, inclusive, and representative** of user populations
- Algorithms are only as good as their data pipelines [ISACA AI Algorithm Audits]
- Developing and evaluating processes for human auditing (with AI uplift)
- AI control benefits from ability to audit suspicious activity with human labor [AISI UK]

### 5.3 Representation Concerns

**Cultural and Linguistic Bias:**
- Current LLMs exhibit prevalent tendency toward **"Western-centric" perspectives**
- Often result in insufficient or distorted representations of low-salience cultures [De Gruyter Cultural Bias]
- LLMs generally exhibiting Western cultural centrism and stereotypes against low-resource cultures [ResearchGate Cultural Datasets]

**Training Data Diversity Issues:**
- Issue stems primarily from significant imbalances in training data across **linguistic, geographic, and cultural dimensions**
- LLMs trained on high-resource languages struggle to generalize to low-resource languages
- Face diverse safety challenges across various languages [ArXiv CultureLLM]

**Impact on Linguistic Diversity:**
- Training practices lead to noticeable **decrease in diversity** of models' outputs over successive iterations
- Undermines preservation of linguistic richness [ArXiv Homogenizing Effect]
- 2025 research shows concerns about **shrinking landscape of linguistic diversity** in age of LLMs [Frontiers Sociolinguistic Foundations]

### 5.4 Cultural and Linguistic Diversity

**Multilingual LLM Development (2024-2025):**

**Nigeria (2024):**
- Launched first multilingual LLM trained on **five low-resource languages** and accented English [AI Data Insider Language Diversity]

**African Next Voices:**
- Developed AI-compatible datasets for **18 African languages**

**Switzerland (September 2025):**
- Released **Apertus** supporting over **1,000 languages**
- 40% of training data in non-English languages, including underrepresented languages like Swiss German and Romansh [AI Data Insider]

**Mitigation Strategies:**
- **Systematic survey (2023-2025):** Reviewed over 100 representative studies examining four critical dimensions:
  - Data sourcing strategies
  - Quality assurance methodologies
  - Data categories
  - Data content [ResearchGate Cultural Datasets]
- Research suggests both **linguistic variation and cultural cues** in input prompts serve as valuable signals for models to generate more inclusive and varied content [ArXiv Multilingual Prompting]

---

## 6. Key Takeaways and Trends

### Self-Imposed Restrictions:
1. **Diverging User Data Policies:** Companies split between opt-in (traditional) and opt-out by default (Anthropic, xAI)
2. **Constitutional and Safety Frameworks:** Anthropic's Constitutional AI and Google's Frontier Safety Framework represent formal commitments, though enforcement varies (Google's 2025 violation)
3. **Open-Weights vs. Closed Models:** Meta's open-weights approach with restrictive licensing vs. fully closed proprietary models

### Content Restrictions:
1. **Universal CSAM Filtering:** All major companies maintain zero tolerance, but datasets for moderation tools have been found to contain CSAM
2. **Copyright Litigation:** Mixed fair use rulings with billion-dollar settlements (Anthropic $1.5B) reshaping industry
3. **PII Memorization:** Dynamic privacy risks—adding PII can increase other PII memorization by 7.5x

### Licensing Trends:
1. **Major Revenue Stream:** Reddit $203M, Shutterstock $104M (2023), Amazon-NYT $20-25M annually
2. **News Publisher Deals:** Shift from litigation to licensing (NYT simultaneously suing OpenAI/Microsoft while licensing to Amazon)
3. **Academic Datasets:** Market projected to grow from $381.8M (2024) to $1.59B (2030)

### Technical Restrictions:
1. **Escalating Web Scraping Wars:** 70% increase in sites blocking AI crawlers; 13.26% of AI bots ignore robots.txt
2. **Extreme Crawl Ratios:** Anthropic 73,000:1, OpenAI 1,700:1 vs. Google 14:1
3. **Synthetic Data Risks:** 74% of webpages now AI-generated; model collapse concerns unless mixed with human data

### Ethical Review:
1. **Red Teaming Standardization:** Government initiatives (UK AISI, US ODNI) formalizing red teaming processes
2. **Cultural Bias Persistence:** Western-centric perspectives dominate; 40% non-English data (Apertus) represents progress
3. **Bias Auditing Gaps:** 70% license omission rates and 50% error rates on popular dataset hosting sites

### Security Concerns:
1. **AI-Enabled Attacks:** 80% of ransomware now uses AI; 23.77M secrets leaked via AI in 2024 (25% increase)
2. **Dark LLMs:** Emergence of HackerGPT, WormGPT, FraudGPT on dark web
3. **Disinformation Scale:** Russian "Pravda" network created 3.6M articles influencing chatbots 33% of the time

---

## Sources

### Anthropic
- [Claude's Constitution](https://www.anthropic.com/news/claudes-constitution)
- [Constitutional AI: Harmlessness from AI Feedback](https://www-cdn.anthropic.com/7512771452629584566b6303311496c262da1006/Anthropic_ConstitutionalAI_v2.pdf)
- [Anthropic's Responsible Scaling Policy](https://www.anthropic.com/responsible-scaling-policy)
- [Anthropic users face new choice on AI training | TechCrunch](https://techcrunch.com/2025/08/28/anthropic-users-face-a-new-choice-opt-out-or-share-your-data-for-ai-training/)
- [Understanding Anthropic's Data Usage Policy](https://rits.shanghai.nyu.edu/ai/understanding-anthropics-data-usage-policy-what-users-need-to-know/)
- [Collective Constitutional AI](https://www.anthropic.com/research/collective-constitutional-ai-aligning-a-language-model-with-public-input)
- [How up-to-date is Claude's training data?](https://support.claude.com/en/articles/8114494-how-up-to-date-is-claude-s-training-data)

### OpenAI
- [Model Spec (2025/12/18)](https://model-spec.openai.com/2025-12-18.html)
- [Usage policies | OpenAI](https://openai.com/policies/usage-policies/)
- [Enterprise privacy at OpenAI](https://openai.com/enterprise-privacy/)
- [Does ChatGPT Store Your Data in 2025? | Nightfall AI](https://www.nightfall.ai/blog/does-chatgpt-store-your-data-in-2025)
- [OpenAI Updates Usage Policies | Baker Donelson](https://www.bakerdonelson.com/openai-updates-usage-policies-key-considerations-and-next-steps-for-organizations-deploying-ai)
- [Knowledge Cutoff Dates in Large Language Models](https://www.allmo.ai/articles/list-of-large-language-model-cut-off-dates)
- [GPT-5 Training Data: Evolution, Sources, and Ethical Concerns | TTMS](https://ttms.com/gpt-5-training-data-evolution-sources-and-ethical-concerns/)

### Google DeepMind
- [Responsible AI: Our 2024 report](https://blog.google/innovation-and-ai/products/responsible-ai-2024-report-ongoing-work/)
- [Published in February 2025 Responsible AI Progress Report](https://ai.google/static/documents/ai-responsibility-update-published-february-2025.pdf)
- [British lawmakers accuse Google DeepMind | Fortune](https://fortune.com/2025/08/29/british-lawmakers-accuse-google-deepmind-of-breach-of-trust-over-delayed-gemini-2-5-pro-safety-report/)
- [Generative AI Prohibited Use Policy](https://policies.google.com/terms/generative-ai/use-policy)
- [Gemini app safety and policy guidelines](https://gemini.google/policy-guidelines/)

### Meta
- [Llama (language model) - Wikipedia](https://en.wikipedia.org/wiki/LLaMA)
- [Meta Llama 4 in 2025: Open-Weights, Licensing, and AI's Future](https://skywork.ai/blog/meta-llama-4-open-weights-2025/)
- [Llama 3 Guide | Kili Technology](https://kili-technology.com/large-language-models-llms/llama-3-guide-everything-you-need-to-know-about-meta-s-new-model-and-its-data)
- [Are Meta's Llama LLMs Open Source?](https://www.itprotoday.com/it-operations/meta-s-llama-llms-spark-debate-over-open-source-ai)

### Mistral AI
- [Mistral AI Models 2025: European AI Excellence Guide](https://local-ai-zone.github.io/brands/mistral-ai-european-excellence-guide-2025.html)
- [Mistral AI & data protection](https://weventure.de/en/blog/mistral)
- [Mistral AI warns of lack of data centres in Europe | Euronews](https://www.euronews.com/next/2024/06/14/mistal-ai-warns-of-lack-of-data-centres-training-capacity-in-europe)
- [European Commission's AI Code of Practice | Jones Day](https://www.jonesday.com/en/insights/2025/02/european-commissions-ai-code-of-practice-and-training-data-template)
- [The complete guide to Mistral AI - DataNorth AI](https://datanorth.ai/blog/the-complete-guide-to-mistral-ai)

### xAI (Grok)
- [Consumer FAQs | xAI](https://x.ai/legal/faq)
- [Privacy Policy | xAI](https://x.ai/legal/privacy-policy)
- [X claims right to share private AI chats | CryptoSlate](https://cryptoslate.com/how-the-new-x-terms-of-service-gives-grok-permission-to-use-anything-you-say-forever-with-no-opt-out/)
- [Grok AI training on user data by default](https://www.siliconrepublic.com/business/grok-ai-training-x-twitter-default-user-data-privacy-turn-off)
- [X Restricts AI Model Training on Its Platform](https://theoutpost.ai/news-story/x-bans-ai-model-training-on-its-content-signaling-shift-in-data-access-strategy-16271/)
- [X Updates Terms of Service](https://www.socialmediatoday.com/news/x-formerly-twitter-updates-terms-service/730223/)

### CSAM and Content Moderation
- [Child sexual abuse images in AI moderation dataset](https://www.protectchildren.ca/en/press-and-media/news-releases/2025/csam-nude-net)
- [Evaluation of LLM Safety Systems](https://arxiv.org/pdf/2505.10588)
- [SAFETY BY DESIGN FOR GENERATIVE AI | Thorn](https://info.thorn.org/hubfs/thorn-safety-by-design-for-generative-AI.pdf)
- [Ensuring LLM Outputs Adhere to Content Guidelines](https://www.rohan-paul.com/p/ensuring-llm-outputs-adhere-to-content)
- [Towards Safer Pretraining | IJCAI 2025](https://arxiv.org/html/2505.02009v2)

### Violence and Harmful Content
- [Artificial Intelligence 2025 Legislation | NCSL](https://www.ncsl.org/technology-and-communication/artificial-intelligence-2025-legislation)
- [Federal and State Regulators Target AI | Crowell & Moring](https://www.crowell.com/en/insights/client-alerts/federal-and-state-regulators-target-ai-chatbots-and-intimate-imagery)
- [New State AI Laws | King & Spalding](https://www.kslaw.com/news-and-insights/new-state-ai-laws-are-effective-on-january-1-2026-but-a-new-executive-order-signals-disruption)
- [Training AI and Employer Liability | Epstein Becker Green](https://www.workforcebulletin.com/training-artificial-intelligence-and-employer-liability-lessons-from-schuster-v-scale-ai)

### PII and Privacy
- [Privacy considerations for LLMs | Frontiers](https://www.frontiersin.org/journals/communications-and-networks/articles/10.3389/frcmn.2025.1600750/full)
- [Privacy Ripple Effects | ArXiv](https://arxiv.org/abs/2502.15680)
- [Building LLMs with sensitive data | Sigma AI](https://sigma.ai/llm-privacy-security-phi-pii-best-practices/)
- [LLM Privacy Protection 2025 | Protecto AI](https://www.protecto.ai/blog/llm-privacy-protection-strategies-2025)
- [Privacy and Data Protection Risks](https://www.aigl.blog/privacy-and-data-protection-risks-in-large-language-models-llms/)

### Copyright
- [Copyright Office Weighs In | Skadden](https://www.skadden.com/insights/publications/2025/05/copyright-office-report)
- [Copyright and AI Collide | IPWatchdog](https://ipwatchdog.com/2025/12/23/copyright-ai-collide-three-key-decisions-ai-training-copyrighted-content-2025/)
- [Fair Use in AI Copyright Lawsuits | Ropes & Gray](https://www.ropesgray.com/en/insights/alerts/2025/07/a-tale-of-three-cases-how-fair-use-is-playing-out-in-ai-copyright-lawsuits)
- [AI and Fair Use | ACC](https://www.acc.com/resource-library/ai-and-fair-use-two-us-court-decisions-shaping-landscape)
- [Researchers suggest OpenAI trained on paywalled O'Reilly books | TechCrunch](https://techcrunch.com/2025/04/01/researchers-suggest-openai-trained-ai-models-on-paywalled-oreilly-books/)

### Reddit Licensing
- [Reddit Is Winning the AI Game | CJR](https://www.cjr.org/analysis/reddit-winning-ai-licensing-deals-openai-google-gemini-answers-rsl.php)
- [Reddit's New AI Licensing Deal | Media and the Machine](https://mediaandthemachine.substack.com/p/reddits-new-ai-licensing-deal-shows)
- [OpenAI inks deal with Reddit | TechCrunch](https://techcrunch.com/2024/05/16/openai-inks-deal-to-train-ai-on-reddit-data/)
- [Reddit says it's made $203M licensing data | TechCrunch](https://techcrunch.com/2024/02/22/reddit-says-its-made-203m-so-far-licensing-its-data/)

### News Organization Partnerships
- [Timeline of major deals 2025 | Digiday](https://digiday.com/media/a-timeline-of-the-major-deals-between-publishers-and-ai-tech-companies-in-2025/)
- [Amazon-NYT AI Licensing Deal | eWeek](https://www.eweek.com/news/amazon-new-york-times-licensing-deal-ai-training/)
- [2024 timeline | Digiday](https://digiday.com/media/2024-in-review-a-timeline-of-the-major-deals-between-publishers-and-ai-companies/)
- [List of publishers who partner with AI | Profound](https://www.tryprofound.com/resources/articles/ai-model-publisher-partners)
- [Who's suing AI and who's signing | Press Gazette](https://pressgazette.co.uk/platforms/news-publisher-ai-deals-lawsuits-openai-google/)

### Stock Photo Licensing
- [Shutterstock AI Licensing Business | Stock Photo Secrets](https://www.stockphotosecrets.com/news/shutterstocks-ai-licensing-business.html)
- [Shutterstock Made $104 Million | PetaPixel](https://petapixel.com/2024/06/04/shutterstock-made-104-million-licensing-assets-to-ai-devs-last-year/)
- [Getty's Billion Dollar Question](https://legalspecialsituations.substack.com/p/gettys-billion-dollar-question-who)
- [Apple Signs Deal with Shutterstock | Inc.](https://www.inc.com/kit-eaton/apple-signs-deal-for-ai-training-data-from-image-service-shutterstock.html)
- [Can Getty and Shutterstock Survive? | Foster Fletcher](https://fosterfletcher.com/under-siege-can-getty-and-shutterstock-survive-the-rise-of-generative-ai/)

### Academic Datasets
- [AI Datasets & Licensing Market | Grand View Research](https://www.grandviewresearch.com/industry-analysis/ai-datasets-licensing-academic-research-publishing-market-report)
- [Large-scale audit of dataset licensing | Nature](https://www.nature.com/articles/s42256-024-00878-8)
- [Data Provenance Initiative | ArXiv](https://arxiv.org/abs/2310.16787)
- [LAION-5B | OpenReview](https://openreview.net/forum?id=M3Y74vmsMcY)
- [LAION dataset used to train Stable Diffusion | TechCrunch](https://techcrunch.com/2024/08/30/the-org-behind-the-data-set-used-to-train-stable-diffusion-claims-it-has-removed-csam/)
- [German court: LAION's dataset is legal](https://walledculture.org/german-court-laions-generative-ai-training-dataset-is-legal-thanks-to-eu-copyright-exceptions/)
- [Common Crawl - Wikipedia](https://en.wikipedia.org/wiki/Common_Crawl)
- [Training Data for Price of Sandwich | Mozilla](https://www.mozillafoundation.org/en/research/library/generative-ai-training-data/common-crawl/)

### Web Scraping Restrictions
- [Publishers block bots | The Register](https://www.theregister.com/2025/12/08/publishers_say_no_ai_scrapers/)
- [How to Block AI Web Crawlers | Stytch](https://stytch.com/blog/how-to-block-ai-web-crawlers/)
- [Cloudflare Control Content Use](https://blog.cloudflare.com/control-content-use-for-ai-training/)
- [Cloudflare Changed How AI Crawlers Scrape | Cloudflare Press](https://www.cloudflare.com/press/press-releases/2025/cloudflare-just-changed-how-ai-crawlers-scrape-the-internet-at-large/)
- [Scrapers Selectively Respect robots.txt | ArXiv](https://arxiv.org/html/2505.21733v2)
- [New AI web standards 2026 | DEV](https://dev.to/astro-official/new-ai-web-standards-and-scraping-trends-in-2026-rethinking-robotstxt-3730)

### API Access Restrictions
- [AI Data Privacy Mistake | Medium](https://medium.com/@buddhiran/the-ai-data-privacy-mistake-that-could-cost-you-everything-a-2025-guide-to-data-privacy-05beed37a20f)
- [Don't Get Sued Over AI Data | Traverse Legal](https://www.traverselegal.com/blog/ai-data-ownership-legal-risks/)
- [California's AB 2013 | Crowell & Moring](https://www.crowell.com/en/insights/client-alerts/californias-ab-2013-requires-generative-ai-data-disclosure-by-january-1-2026)
- [FTC Reminds AI Companies | Hunton](https://www.hunton.com/privacy-and-information-security-law/ftc-reminds-ai-companies-to-uphold-privacy-commitments)

### Synthetic Data
- [State of LLMs 2025 | Sebastian Raschka](https://magazine.sebastianraschka.com/p/state-of-llms-2025)
- [AI Model Collapse Risk 2025 | WINN Solutions](https://www.winssolutions.org/ai-model-collapse-2025-recursive-training/)
- [Synthetic Data Generation | ArXiv](https://arxiv.org/html/2503.14023v2)
- [2025: The year in LLMs | Simon Willison](https://simonwillison.net/2025/Dec/31/the-year-in-llms/)
- [Selecting and Preparing Training Data 2024-2025](https://www.rohan-paul.com/p/selecting-and-preparing-training)

### Medical/Legal AI
- [AI In Medicine And Malpractice | McCune Wright](https://mccunewright.com/blog/2025/07/artificial-intelligence-ai-medical-malpractice/)
- [Medical Malpractice 2025 | Brandon J Broderick](https://www.brandonjbroderick.com/medical-malpractice-2025-how-ai-healthcare-changing-lawsuits)
- [Legal implications of AI in diagnostics](https://www.bio-conferences.org/articles/bioconf/pdf/2025/03/bioconf_ichbs2025_01034.pdf)
- [Liability for Use of AI in Medicine | Michigan Law](https://repository.law.umich.edu/cgi/viewcontent.cgi?article=1569&context=book_chapters)
- [State of Healthcare AI Regulations | Holistic AI](https://www.holisticai.com/blog/healthcare-laws-us)
- [Legal Risks Behind AI Use | MedCentral](https://www.medcentral.com/ai/legal-risks-behind-ai-use)

### Security and Malware
- [Traditional Security Frameworks Leave Organizations Exposed | HackerNews](https://thehackernews.com/2025/12/traditional-security-frameworks-leave.html)
- [Biggest AI Security Vulnerabilities 2025 | BlackFog](https://www.blackfog.com/understanding-the-biggest-ai-security-vulnerabilities-of-2025/)
- [AI coding tools security exploits | Fortune](https://fortune.com/2025/12/15/ai-coding-tools-security-exploit-software/)
- [Understanding future of offensive AI | IBM](https://www.ibm.com/think/x-force/understanding-future-of-offensive-ai-in-cybersecurity)
- [AI Security Report 2025 | Check Point](https://blog.checkpoint.com/research/ai-security-report-2025-understanding-threats-and-building-smarter-defenses/)
- [State of AI Security Report 1H 2025 | Trend Micro](https://www.trendmicro.com/vinfo/us/security/news/threat-landscape/trend-micro-state-of-ai-security-report-1h-2025)
- [AI Cybersecurity Threats 2025 | DeepStrike](https://deepstrike.io/blog/ai-cybersecurity-threats-2025)
- [AI Ransomware Revolution | IntelligenceX](https://blog.intelligencex.org/ai-powered-ransomware-attacks-2025-artificial-intelligence-cybercrime)

### Red Teaming and Bias Auditing
- [Empirical Investigations Into AI Monitoring | AISI UK](https://alignmentproject.aisi.gov.uk/research-area/empirical-investigations-into-ai-monitoring-and-red-teaming)
- [LLM Red Teaming Guide | Confident AI](https://www.confident-ai.com/blog/red-teaming-llms-a-step-by-step-guide)
- [Red Teaming Datasets | AI Competence](https://aicompetence.org/red-teaming-datasets-stress-test-training/)
- [AI Algorithm Audits | ISACA](https://www.isaca.org/resources/news-and-trends/industry-news/2024/ai-algorithm-audits-key-control-considerations)
- [Red Teaming to Implement Ethical AI | Knowledge Management Depot](https://knowledgemanagementdepot.com/2024/11/29/red-teaming-to-implement-ethical-ai-solutions/)
- [Evaluating Risk Mitigation Practices | SEI CMU](https://www.sei.cmu.edu/annual-reviews/2024-year-in-review/evaluating-risk-mitigation-practices-for-generative-ai-in-high-sensitivity-domains/)
- [What is AI Red Teaming? | Mindgard](https://mindgard.ai/blog/what-is-ai-red-teaming)

### Cultural and Linguistic Diversity
- [Cultural Bias in LLMs | De Gruyter](https://www.degruyterbrill.com/document/doi/10.1515/jtc-2023-0019/html?lang=en)
- [Homogenizing Effect of LLMs | ArXiv](https://www.arxiv.org/pdf/2508.01491)
- [LLM Developers Building for Language Diversity | AI Data Insider](https://aidatainsider.com/ai/llm-developers-building-for-language-diversity-in-2025/)
- [Systematic Survey of Cultural Datasets | ResearchGate](https://www.researchgate.net/publication/398429883_A_Systematic_Survey_of_Cultural_Datasets_for_Equitable_LLM_Alignment)
- [Sociolinguistic foundations of language modeling | Frontiers](https://www.frontiersin.org/journals/artificial-intelligence/articles/10.3389/frai.2024.1472411/full)
- [Multilingual Prompting | ArXiv](https://arxiv.org/html/2505.15229v1)
- [CultureLLM | ArXiv](https://arxiv.org/pdf/2402.10946)

---

## Conclusion

The landscape of LLM training data restrictions and ethical considerations has evolved dramatically from 2024-2025, marked by:

1. **Regulatory maturation:** From voluntary commitments to enforceable frameworks (EU AI Act, California AB 2013, UK AISI)
2. **Copyright precedent-setting:** Mixed court rulings establishing that fair use is case-by-case, with billion-dollar settlements reshaping industry economics
3. **Licensing ecosystem emergence:** Data becoming valuable commodity with Reddit, news organizations, and stock photo companies generating hundreds of millions in revenue
4. **Technical arms race:** Web scraping restrictions intensifying (70% increase in blocked sites) while AI bot non-compliance rising (13.26% ignore robots.txt)
5. **Cultural recognition:** Growing acknowledgment of Western-centric bias with initial efforts toward linguistic diversity (Apertus 40% non-English, Nigeria/Africa multilingual LLMs)
6. **Security escalation:** AI-enabled attacks (80% of ransomware), dark LLMs, and 23.77M secret leaks highlighting dual-use risks
7. **Synthetic data paradox:** Increasingly necessary for scaling but posing model collapse risks without careful human data mixing

The field remains in flux, with fundamental tensions unresolved:
- **Openness vs. safety** (Meta's open-weights vs. OpenAI's closed approach)
- **Privacy vs. improvement** (opt-in vs. opt-out by default)
- **Fair use vs. compensation** (legal uncertainty driving licensing deals)
- **Democratization vs. control** (concern that restrictions create tiered ecosystem favoring well-resourced actors)

As AI capabilities advance, these restrictions will likely tighten while simultaneously becoming more sophisticated, balancing innovation with responsibility, access with safety, and commercial interests with public good.

---

**Report compiled:** January 16, 2026
**File location:** `/Users/erichowens/coding/some_claude_skills/LLM_TRAINING_DATA_RESTRICTIONS_REPORT.md`
