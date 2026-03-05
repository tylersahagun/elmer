Integrating Remotion into the PM Workspace 🚀
Overview of Remotion: Code-Driven Video Creation

Remotion is an open-source framework that lets you create videos programmatically using React (JavaScript/TypeScript) components. Instead of manually editing timelines, you write code for scenes, graphics, and animations – treating a video like a web page composed of React components. This approach offers precise control over visuals and motion: you can use CSS, SVG, Canvas, etc., and leverage programming logic (variables, APIs, data) to generate dynamic content. In other words, every frame is rendered from code, enabling advanced effects and data-driven visuals that would be tedious in traditional editors. Remotion provides tools like a live preview Studio and the ability to render to actual video files (MP4, GIF) either locally or in the cloud. It has a vibrant community (30k+ stars on GitHub) and is free for individual devs and small teams (larger companies need a license).

Key Benefits of Remotion:

Full Creative Control: Because videos are built with code, you can precisely dictate every element: layout, timing, transitions, etc., similar to how you’d build a webpage. This is ideal for on-brand visuals where consistency and accuracy matter.

Reuse and Parameterization: You can create reusable React components for animations or scenes, and feed dynamic data (props) into them to easily generate variations of a video. For example, the same template could render personalized videos per customer by just swapping data.

Scalable Automation: Remotion can be run server-side or even serverlessly (e.g. via Remotion Lambda) to generate videos in batch or on-demand. This means the PM workspace could eventually automate producing a video whenever certain events happen (like a release).

Modern Web Tech: It uses familiar web technologies (HTML/CSS/JS). Developers on the team don’t need to learn a new proprietary video tool – they can apply standard React and web skills.

Good Use Cases: Remotion excels at videos that feature custom graphics, UI mockups, text overlays, or data visualization. Think product promo videos, feature launch trailers, dashboard visualizations, social media clips, snappy explainers, tutorials, or even animated UI flows. Essentially, any scenario where we want polished, on-brand visuals (charts, highlights, step-by-step showcases) can be coded and consistently reproduced. If you’ve seen “year in review” stat videos or animated product announcement posts – those are prime candidates.

Limitations: Because it’s code-based, Remotion isn’t the solution for completely free-form creative video (e.g. filming people or generating photorealistic scenes). Pure generative video tools (like Runway Gen-3 or Synthesia) can produce footage or talking avatars from AI – but they offer limited control over details. Remotion, by contrast, gives deterministic output (the same code yields the same video) and fine control, but requires designing the visuals. In practice, this means Remotion is best when you have or can create the graphical assets or design you want, and need them orchestrated perfectly. For things like live-action videos or human avatars, a tool like Synthesia might be better – but for UI demos, animated infographics, or stylized feature highlights, Remotion shines. It essentially bridges the gap between manual video editing and one-click AI video generators, letting us get the exact look we want (via code) without manual effort (thanks to AI writing that code).

Remotion + AI: Prompt-to-Video with Claude Code and Agent Skills

One of the most exciting aspects of Remotion is how it can be paired with AI coding assistants to generate videos from a natural language prompt. In 2026, Anthropic’s Claude Code (a variant of the Claude AI tuned for coding) demonstrated it can “one-shot” build a full promo video via Remotion from a single conversation. In simple terms, you describe the video you want, and the AI writes the React code, then renders the video for you. This new workflow turns video creation into a dialogue with an AI agent: you specify the concept in plain English, and the agent handles the technical implementation (writing components, configuring Remotion, and fixing any code errors along the way).

How is this possible? Two concepts make it work: Agent Skills and AI-optimized docs. Remotion provides an official set of “Remotion Agent Skills” – basically a bundle of guidelines and best practices formatted for AI agents like Claude, ChatGPT (Codex), or Cursor. These skill files teach the AI how to use Remotion effectively: the expected project structure, common APIs (like how to create a Composition, set duration, add <Audio>, etc.), animation techniques, and even design tips (e.g. “use spring animation for bouncy effect”). By loading these skills into the AI’s context, the AI becomes aware of Remotion’s “vocabulary” and best practices for animations, composition, text effects, and rendering.

Remotion’s documentation is also AI-friendly – every doc page can be fetched as raw Markdown, and there’s even an integrated chatbot in the docs for Q&A. This means our AI agents in the PM workspace can easily pull up Remotion docs or examples when needed. For instance, Claude can automatically fetch Remotion’s docs if it needs to confirm an API detail, thanks to those Markdown endpoints. Remotion essentially anticipated AI usage and made its docs and tooling “AI-native.”

Claude Code Integration: Claude Code (the coding agent) is especially powerful here because it can execute commands in a sandbox and iteratively refine the code. To use Remotion with Claude, you set up a Remotion project (Node.js environment) and then run claude in that project – Claude will load the Remotion Agent Skills automatically if present. From there, you can literally say “Create a 30s video showcasing our new Dashboard feature with upbeat music and slide-in text highlights”, and Claude (with the skill prompts) will generate the React code, create any needed files, and even run the Remotion CLI to render an MP4 file. It’s an example of an “AI agentic workflow”: the AI not only writes code but also uses tools to produce the final output.

Example: In a demo by the Remotion team, an AI agent was prompted to “Create a terminal-style video showing a git workflow with typewriter effects”. The agent (Claude) loaded the Remotion best-practice skills, scaffolded a new project, wrote multiple React components (for the terminal scene), and executed npx remotion render – producing a 14-second HD video, all in one go. The video included blinking cursors, typewritten commands, and an animated “deployed” message at the end, demonstrating how detailed and correct the AI-generated output can be with the right guidance.

Agent Skills in Our Workspace: We should plan to incorporate Remotion’s agent skill files or an adaptation of them into our PM Workspace context. This might mean adding the Remotion best practices rules into our .cursor/skills or .cursor/rules so that our AI (which currently uses GPT-4 via Cursor) is equipped with similar knowledge. Since our environment already uses a layered context system (Rules → Skills → Subagents), we can slot the Remotion guidance into that. For example, we might create a new Skill file called remotion-video/SKILL.md that contains distilled guidance from Remotion’s agent skills (covering topics like how to set up compositions, use <Video> and <Audio> components, apply easing curves, etc.). This skill would be activated when the agent is tasked with video generation (e.g. via a /video command). By doing this, even if we’re using GPT-4 (which may not have seen Remotion 2026 docs), we explicitly give it the know-how to use Remotion effectively. It’s akin to giving our AI a “crash course” in motion design coding.

Prerequisites: To actually render videos, the environment running the PM workspace will need Node.js (16+), and Remotion itself (plus ffmpeg if not bundled). If we integrate with Claude Code, note that Claude Code is a separate product that requires a subscription. In our initial implementation, we might use our existing AI (GPT-4) to draft the Remotion code and have a human run it, or use Cursor’s execution capabilities if available. Over time, for full automation, we could explore using Claude or another agent that can run commands in our CI environment.

Where Remotion Fits in the PM Workflow

We want to add Remotion in a way that augments our Product Management workflow, particularly in the later stages of an initiative when we’re ready to communicate what was built. The obvious area where video fits is Product Marketing (PMM) and stakeholder updates. Currently, our PM workspace supports generating written documentation (PRDs, design briefs), prototypes, and even visual artifacts like branded posters/images (via the /visual-digest command). Adding video generation would take this a step further – enabling automatic creation of feature demo videos or release promo videos once a feature is ready.

Ideal Points in Workflow to Trigger Video Generation:

After Prototyping / Before Launch: Once an initiative has a working prototype or completed feature (code merged), we could generate a short promo video to include in release notes or as enablement for Sales/CS. For example, after /proto [name] and testing/validation, a product manager might run /promo-video [name] to get a draft video showcasing the new capability.

During Launch GTM Prep: Our /PM [name] command already creates PRD, eng spec, GTM brief, etc. We can extend the GTM (go-to-market) to include a video asset. Perhaps a sub-step in the GTM brief could be “generate product video”. This ensures Marketing has a head start with an AI-generated video that they can fine-tune.

Automated on Merge to Main (Continuous Demos): Eventually, we can automate triggers: e.g. whenever a Pull Request labeled “feature” is merged, the workspace agent could automatically kick off a video generation for that feature. This video could then be posted to a Slack channel or added to the Notion launch page. This aligns with our goal of having all info live in AskElephant – even the demos.

Investor or Team Updates: In addition to individual feature videos, we could use Remotion to compile “release highlight reels” each cycle. Imagine the /synthesize or /status-all command culminating in a 1-minute video of the top 3 features delivered that quarter, with text callouts and maybe team credits. This could be great for company-wide demos or investor newsletters.

Good vs Bad Use in Our Context:

A Remotion-generated video is great for showing UI changes or new user flows. For instance, if we built a new Dashboard, the video could animate through the dashboard with text pop-ups highlighting new metrics available. If the feature is an integration (e.g. Dialpad telephony integration), the video might show an animated phone icon and captions like “Calls are now automatically transcribed and analyzed in AskElephant!” – reinforcing the value prop.

It might be less suitable for pure talking-head updates or abstract strategy. Those might still be better as written or live communication. We should use Remotion where visuals add value – e.g. showcasing the product in action or visualizing data. If a feature has no UI (backend improvements), we might skip video or just do a simple infographic style. The agent should recognize when a video would be engaging versus when it’d be forced.

Designing the Remotion Video Agent & Commands

To integrate this cleanly, we will introduce a new command and sub-agent dedicated to video creation, along with supporting skills/rules:

New Command: e.g. /promo-video [initiativeName] (alias /video for short). This command can be invoked with an initiative or feature name. It will act as a trigger for the video workflow, similar to how /proto triggers prototype builder or /visual-digest triggers the visual digest process. In our command reference, this might appear under a new category like "Sharing & PMM" or be listed alongside /share (since it’s another form of sharing outcome).

Subagent Handler: The command will delegate to a specialized Video Generation subagent – perhaps named "video-creator" or "promo-producer". We use a subagent because video creation is a complex, multi-step process, and we want an isolated context and possibly a different model (maybe a Claude instance or a code execution environment) to handle it. The subagent’s job is to orchestrate the steps: gather context, plan the video, write code, run the render, and produce the final asset.

Skill File: We will create a skill (procedural guide) called video-generator (or similar) that details how to generate the video. This skill is analogous to our existing visual-digest skill but for motion. It will include things like branding guidelines for video, preferred resolution/duration, and step-by-step instructions for the agent. For example, it might specify: “Use the company color palette for any text or shapes (background #F5F5F5, accent #BFFF00); prefer Inter font (as in our brand) for any text in the video; fade in the logo at start and include a closing slide with our tagline.” By encoding these, we ensure consistency and a “world-class”, on-brand output from the AI.

Rule (if needed): We might add a small .mdc rule file for any auto-context. For example, if the agent is working in an initiatives/[name] folder, a rule could auto-include that initiative’s prd.md or design-brief.md as context, so the video agent knows the feature’s purpose. We already have rules like context-orchestrator.mdc that load relevant files by pattern – we can extend that so the video subagent sees the key points about the feature (problem solved, key benefits) which it can then incorporate as on-screen text or narration cues.

Subagent Workflow: The video-creator subagent will operate in phases (much like our docs-generator subagent does):

Context Gathering: It should load all relevant info on the feature:

Product context: The initiative’s docs (prd.md, any research findings, user persona targeted) to understand the story to tell.

Visual assets: If we have any screenshots or product images (perhaps a prototype URL or design file), though initially the agent might rely on code to simulate UI.

Brand context: Company vision and persona pain points (from product-vision.md or personas.md) to ground the messaging. For example, if Persona A cares about saving time, the video script can emphasize “Now 10x faster!” in text.

Plan the Video Structure: The agent should decide on a storyboard or outline for the video. We’ll instruct it to explicitly think in terms of scenes or segments. For instance:

Scene 1: Company logo + feature name title.

Scene 2: The problem or “before” scenario (maybe a text like “Ever struggled with X?”).

Scene 3: Introduce the new feature as the solution (maybe show a mock UI or an animated representation, with a caption).

Scene 4: Key benefits bullet points (fly-in text or simple transitions for each bullet).

Scene 5: Final call-to-action or ending slate (logo and tagline).

The above is just a template – the agent can tailor it per feature (some technical features might just have 2–3 scenes, whereas a user-facing feature could follow a mini “problem-solution-benefit” narrative). We will encode suggestions like these in the skill prompt (e.g. “structure the video with a clear beginning (title), middle (feature demonstration), and end (call to action)”). If multiple scenes, Remotion allows multiple <Composition>s or a single timeline where we programmatically switch content – the AI will choose an approach.

Code Generation (Remotion React Code): This is the heavy lift. The agent will create one or more React components. Typically:

A main composition component (e.g. PromoVideo.tsx) that defines the video’s canvas size, duration, and orchestrates scenes.

Possibly separate components for each scene (for organization), or it can inline them in one.

Use of Remotion APIs: e.g. <Sequence> to manage timing of scenes, <Audio> to add background music or sound, and animated <div> or <Img> elements for content. We will encourage use of simple text animations (like opacity or slide-in transitions) since text will likely be a primary medium for us.

Ensure the code uses our branding: for example, background color should be our standard light gray, primary text color near-black, accent color lime green for emphasis – the skill will remind the AI of these values so they appear in the code (maybe as hex constants).

Duration: likely keep videos short by default (e.g. 30 seconds or less, which at 30 fps is 900 frames). The agent can decide scene lengths (we might default to 3–5 seconds per text slide, etc.). We can provide guidance like “Aim for 20–30 seconds total unless specified.”

Error handling: If the AI writes code that doesn’t compile or run, the subagent (especially if using Claude Code or a similar execution-enabled environment) should catch that and fix it. This iterative improvement is something Claude Code excels at (it can see runtime errors). If using GPT-4 without execution, we might have to run it and feed back errors manually for now. But we can log any issues and have the AI correct the code accordingly.

Rendering the Video: Once code is ready, the agent needs to render it to an MP4 (or GIF/APNG for shorter loops). We have two approaches:

Automated (ideal): Use a CLI command via an MCP tool. Our workspace could integrate a Shell tool or Node execution tool to run npx remotion render. We saw goose’s AI do exactly this autonomously. If we have a sandbox or CI environment, the subagent can call something like: npx remotion render PromoVideo ./out/video.mp4 --props featureName="Dialpad". We’ll have to ensure Remotion is installed and maybe limit resolution for performance (720p might be enough for previews). This requires that our AI has permission to run commands – which in Cursor might be possible via the tools (the mention of “MCP Tools” in our docs suggests we have some tool integration).

Manual (initial fallback): If automating the render is tricky at first, we can have the agent output the Remotion project files as part of the workspace (like in pm-workspace-docs/videos/[feature]/ folder) so a developer can pull and run it. However, this is less ideal – the goal is one-click video. So we will strive to script it. Perhaps a GitHub Action or an npm script could be invoked by the AI.

Output and Storage: After rendering, the video file (e.g. MP4) should be saved in our repository or a linked storage. Likely, we’ll store it in pm-workspace-docs/videos/ with a sensible naming scheme (maybe videos/initiative-name/feature-shortname.mp4). The agent can then post a completion message with a link to the file in context. For example, it might respond:

✅ Video generated for Dialpad Integration!  
📂 **Saved to:** pm-workspace-docs/videos/dialpad-integration/promo.mp4  
🔗 **Preview:** (perhaps a data: URI or an upload link if we integrate Slack/Notion)

This mirrors how our /agents command confirms documentation generation with a file path.

Review/Iteration: The first version might not be “final cut”. We should allow the PM or designer to review the output. Our agent’s response conventions could include a brief summary of what’s in the video (just like goose’s output listed video contents). This way, the user can confirm it covers the right points. If something is off, we could iterate by re-prompting the agent (e.g. “make the text larger” or “add 5 more seconds about the upcoming feature X”). The subagent could either adjust the code or regenerate if needed. In time, we might implement an /iterate-video [name] command to refine an existing video.

Example: Using the Video Agent for a Feature Launch

Let’s walk through a hypothetical use-case to illustrate the integration:

Feature: “Dialpad Integration” (from our example above). This was a recent initiative that enabled call transcription in AskElephant.

After the feature is built and merged, the PM runs /promo-video Dialpad in the PM workspace.

The AI agent loads context: it fetches the initiatives/dialpad-integration/prd.md to recall the core value prop (e.g. “Sales calls are now captured automatically”), and personas.md to see which persona cares (Sales Managers want visibility without manual data entry).

The agent decides on a short 20-second video structure:

Opening: Company logo + title “Dialpad Integration is Live”.

Pain point text: “Tired of manually logging calls?” fading in (speaking to the sales rep’s pain).

Solution visual: An animated phone waveform or an icon, with text “AskElephant now integrates with Dialpad to auto-transcribe your calls.”

Benefits: A quick sequence of three checkmark text lines: “✅ All calls transcribed”, “✅ Key insights highlighted”, “✅ No effort needed from reps” (using green accent checkmarks).

Closing: “Available Now – Turn conversations into insights” with AskElephant logo and perhaps a tag line on a final card.

The agent uses Remotion to implement this:

It creates a 1920x1080 composition, 20s long at 30fps.

It uses our brand colors in CSS for backgrounds and text.

It writes CSS keyframe animations or Remotion’s <spring> for smooth text entrance.

It might even use a stock icon (if we have one in assets) – or just stylized text if not.

The agent executes the render. The PM workspace then outputs a message: “✅ Video generated for Dialpad Integration! Saved to pm-workspace-docs/videos/dialpad-integration/promo.mp4”, and possibly provides an embedded preview (if our interface allows).

The PM downloads or views the video. Suppose they find the second scene text appears a bit too fast to read – they can then prompt, “Make the text stay on screen 1s longer between scenes.” The agent can adjust the timing in code (e.g. increasing durations of sequences) and re-render.

Once satisfied, the PM can attach this video in the next release announcement, and our knowledge base (AskElephant) can index it so others can query it (“show me the Dialpad feature demo”).

This flow shows how seamlessly a PM could go from feature completion to marketing asset creation without leaving the workspace or engaging a design team for first drafts. It accelerates the cycle and ensures the messaging ties directly to the source PRD and personas (since the AI drew from those).

Best Practices for Prompting and Using Remotion Videos

To make this integration successful, we should follow a few best practices (for both the AI agent prompts and the team’s usage of the outputs):

Leverage Brand Guidelines: Just as our Visual Digest skill explicitly lists colors, fonts, and layout principles, our video agent should have a “style guide” to follow. This ensures the video feels like AskElephant. We’ll provide the agent with our primary HEX colors, logo usage rules, and font choices. For example, instruct it that the logo should appear in either the first or last scene, that Inter font is preferred, and to use generous whitespace and a clean layout (no clutter). Consistency builds a world-class, professional impression.

Keep it Simple & Short: We should guide the AI to prefer simpler animations (fade, slide, typewriter text) over extremely flashy or complex ones, unless needed. A 30-second video with clear messaging will usually suffice. The prompt given to the AI (from our side in the skill file) might include tips like “Do not exceed 30s unless explicitly asked; keep each text scene ~3 seconds on screen for readability.” Simplicity also reduces rendering time and chances of errors.

Use Text and Graphics Wisely: Since we may not always have actual screen recordings, the AI’s output will rely on text and vector graphics to convey information. This is fine – e.g., big bold text stating a feature benefit, alongside an icon or illustrative graphic, can get the message across. If possible, we can start curating a small library of SVG icons (for features like “integration”, “analytics”, etc.) that the agent could incorporate. If not, it can use basic shapes (e.g. a phone icon drawn with circles/rectangles or emoji characters as seen in our digest visuals that use icons like 🏆 or 📊). We should advise the agent to use emojis or simple shapes for illustrative purposes when actual images are not available – it’s a neat trick for quick visuals.

Voiceover/Music: Remotion supports adding audio tracks. In early use, we might skip voiceovers (since AI text-to-speech is another complexity and adding human voice requires script and tone considerations). Instead, perhaps use upbeat background music to increase engagement. We can include a royalty-free music track in the project or even have the agent generate one using a tool (though that’s another frontier). At minimum, our agent can insert prompts like “Background music: uplifting tech background” if we have a way to fetch a track. This is optional – even silent videos with text can be effective as quick demos (and then sales reps can narrate live if needed).

Quality Check and Iteration: Emphasize that human review is critical. AI can produce a decent first draft, but a PM or designer should ensure the terminology is correct (e.g., no placeholder text like “Lorem ipsum” sneaks in), the visuals align with our brand tone (e.g., avoid weird colors or fonts not in guide), and the main points are accurately represented. The good news is our AI has our strategy context loaded, so it should avoid messaging that conflicts with our vision/guardrails (it will, for example, not claim a feature does something against our guardrails). Still, a quick content review is wise.

When Not to use: If a feature is minor or very technical (back-end change), a video might not be worth the effort – a simple written update would do. We don’t want to spam every trivial change with a video. So we might reserve the /promo-video for significant user-facing enhancements or launches. This can be a judgment call or we could enforce criteria (like check the initiative’s “impact” field).

Integration with Knowledge Repos: After generating, we should store and share the video appropriately. For example, we can embed the video in our Notion documentation (our /sync-notion process could pick it up). We could also auto-post it to Slack (perhaps the #launches channel) via our Slack skills. Keeping these assets accessible means customer-facing teams can grab the latest demo video from AskElephant itself. This aligns with our goal of having all artifact types (docs, prototypes, images, and now videos) live in the workspace.

In summary, adding Remotion into our PM workspace will enable “words to video” capabilities that turn our planning artifacts directly into polished visual storytelling. With a new /promo-video command, backed by a video-creator subagent and Remotion best-practice skills, the assistant can automatically code and render product videos on demand. This fits naturally after prototyping and documentation – rounding out the product development lifecycle with a marketing deliverable. By following the Remotion docs’ guidance and our own branding rules, we can ensure these AI-generated videos look professional and on-message (no cheesy off-brand animations!). The result: faster go-to-market content, consistent messaging from PRD to promo, and a wow factor for stakeholders as they see features come alive in video form with minimal effort.
