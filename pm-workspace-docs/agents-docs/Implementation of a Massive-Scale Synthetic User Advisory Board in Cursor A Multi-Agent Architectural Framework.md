

## 1. Introduction and Theoretical Foundations

The modern software development lifecycle (SDLC) is increasingly characterized by rapid iteration cycles and continuous deployment. However, a critical bottleneck remains in the upstream phases of requirements gathering, design verification, and user research. Traditional methods—such as focus groups, usability testing, and beta periods—are resource-intensive, slow, and often yield small-sample data that fails to capture the long-tail distribution of user behaviors. The emergence of Large Language Models (LLMs) and Agentic Workflows offers a transformative solution: the instantiation of **Synthetic User Advisory Boards**.

This report details a comprehensive technical architecture for implementing such a system directly within the **Cursor IDE**, leveraging the **Model Context Protocol (MCP)**. The proposed system generates between 1 and 3,000 distinct user personas derived from **AskElephant** client conversation logs, utilizing advanced clustering and sampling techniques to ensure representational fidelity. These personas are activated as dynamic agents to verify prototypes, employing **Condorcet’s Jury Theorem**, **Self-Consistency**, and **Mixture-of-Agents (MoA)** architectures to synthesize thousands of individual critiques into rigorous, actionable design intelligence.

### 1.1 The Shift from Simulation to Agentic Sociology

Historically, "personas" in software design have been static artifacts—marketing documents describing a "typical" user (e.g., "Sally the Senior Developer"). While useful for alignment, these artifacts cannot interact with software. Generative AI enables the transition from static profiles to active **Synthetic Users**—agents capable of reasoning, perceiving interfaces, and articulating feedback based on specific psychographic and demographic constraints.1

However, the deployment of a single synthetic user—or even a homogenous group—suffers from the "Synthetic Persona Fallacy," where the agent reverts to the generalized mean of its training data rather than reflecting the specific nuances of the actual user base.3 To mitigate this, the proposed architecture moves beyond simple simulation to **Agentic Sociology**, treating the population of 3,000 agents as a complex adaptive system. By grounding these agents in real conversation logs (AskElephant data) and enforcing diversity through algorithmic sampling, the system creates a "Digital Twin" of the user base.

### 1.2 Theoretical Anchor: Condorcet’s Jury Theorem (CJT)

The validity of aggregating feedback from 3,000 synthetic agents rests on the mathematical foundation of **Condorcet’s Jury Theorem**. First formulated by the Marquis de Condorcet in 1785, the theorem provides the probabilistic justification for why a large group of imperfect voters can be more reliable than a single expert.4

#### 1.2.1 Mathematical Formulation and Relevance

The theorem posits that for a group of $n$ voters (agents) facing a binary decision (e.g., "Is this UI navigation intuitive?"), where each voter $i$ has an independent probability $p_i$ of making the correct decision, the probability $P_n$ that the majority vote is correct is given by:

$$P_n = \sum_{k=m}^{n} \binom{n}{k} p^k (1-p)^{n-k}$$

where $m = \lfloor n/2 \rfloor + 1$.

The critical implications for our architecture are threefold:

1. **Competence Condition ($p > 0.5$):** The theorem holds only if the average agent is "better than random".4 If $p < 0.5$, increasing the number of agents $n$ to 3,000 drastically increases the probability of a _wrong_ decision convergence. This necessitates the use of **Self-Consistency** mechanisms (Section 5.3) to boost individual agent performance before voting.
    
2. **Independence Condition:** The voters must be statistically independent.6 If 3,000 agents are all instantiated from the same LLM with identical system prompts, their errors will be highly correlated, violating independence and rendering the jury ineffective. This necessitates **Diversity Sampling** (Section 2.3) and **Verbalized Sampling** 8 to decorrelate agent behaviors.
    
3. **Asymptotic Convergence:** As $n \to \infty$, $P_n \to 1$. By scaling to $N=3000$, we maximize the reliability of the consensus, provided the first two conditions are met.
    

### 1.3 Mixture-of-Agents (MoA) Architecture

Processing the qualitative feedback from 3,000 agents exceeds the context window of any single state-of-the-art model. To handle this scale, we employ a **Mixture-of-Agents (MoA)** architecture. MoA is a layered approach where the output of agents in one layer becomes the input for agents in the next, allowing for iterative refinement and aggregation.9

|**Layer**|**Agent Role**|**Cardinality**|**Function**|**Model Class**|
|---|---|---|---|---|
|**0**|**Persona Generator**|1|Analyzes embeddings and generates JSON profiles.|GPT-4o / Opus|
|**1**|**The Jury**|1-3,000|Conducts individual prototype assessments.|GPT-4o-mini / Haiku|
|**2**|**Cluster Aggregators**|20-50|Synthesizes feedback within specific user archetypes.|GPT-4o / Sonnet|
|**3**|**The Adjudicator**|1|Synthesizes cluster reports into final advisory.|Claude 3.5 Sonnet|

_Table 1: The Layered Mixture-of-Agents Architecture for Scalable Design Verification._

This hierarchical structure allows the system to compress the high-entropy signal from the Jury layer into structured, low-entropy insights at the Adjudicator layer, effectively simulating a corporate boardroom where sub-committees report to a chair.11

### 1.4 The Bayesian Truth Serum (BTS)

While CJT works for objective "correctness," design feedback is often subjective. Majority voting in subjective domains can lead to mediocrity. To counter this, the system integrates the **Bayesian Truth Serum (BTS)** developed by Prelec.13 BTS scores agents not just on their answer, but on how well they predict the distribution of _other_ agents' answers. It rewards "surprisingly common" answers—opinions that are more prevalent than the crowd predicts—thereby identifying "expert" or "honest" signals that might be suppressed in a simple majority vote.15

---

## 2. Data Ingestion: The AskElephant Persona Pipeline

The integrity of the advisory board is entirely dependent on the quality of the personas. Generic personas lead to generic feedback. To achieve high-fidelity simulation, we must extract personas directly from the raw conversation logs provided by AskElephant.

### 2.1 Schema Definition and Ingestion

We assume the input data consists of JSON-formatted conversation logs. The ingestion pipeline must parse these logs to construct a "context document" for each unique user ID.

- **Input Format:** JSON arrays containing message objects with fields for `timestamp`, `speaker` (User/Bot), `content`, and metadata (e.g., `platform`, `session_duration`).
    
- **Preprocessing:** The system aggregates all `content` where `speaker == 'User'` for a specific `user_id` into a single text block. This block represents the user's "voice."
    
- **Anonymization:** Privacy preservation is paramount. Before processing, all text passes through a local Named Entity Recognition (NER) model (e.g., Microsoft Presidio) to scrub PII such as names, emails, and phone numbers, replacing them with tokens (e.g., `<PERSON>`, `<EMAIL>`).16
    

### 2.2 Vector Embeddings and K-Means Clustering

To scale from individual logs to representative archetypes, we employ unsupervised learning.

#### 2.2.1 The Embedding Space

Each anonymized user context is passed to an embedding model (e.g., `text-embedding-3-small` or `nomic-embed-text`) to generate a high-dimensional vector. This vector encapsulates the user's semantic intent, frustration levels, and technical literacy.17

#### 2.2.2 K-Means Clustering

We apply the **K-Means Clustering** algorithm to the set of user vectors.

- **Objective:** Partition the $N$ users into $k$ distinct clusters ($C_1,... C_k$) such that users within a cluster are semantically similar.
    
- **Determining $k$:** The system dynamically calculates the optimal number of clusters using the **Elbow Method**, identifying the point where the reduction in Within-Cluster Sum of Squares (WCSS) diminishes marginally.18 Typically, for a dataset of thousands of logs, $k$ might range from 5 to 20 distinct archetypes.
    

This clustering step effectively "compresses" the noisy individual data into clear signals representing "The Power User," "The Confused Novice," "The Feature Requestor," etc..19

### 2.3 Verbalized Sampling for Diversity Generation

A critical failure mode in synthetic data generation is **Mode Collapse**, where an LLM prompted to "generate a user from Cluster A" repeatedly outputs the exact same "average" user profile.8 To generate 3,000 _distinct_ agents, we must force the model to explore the tails of the distribution.

We implement **Verbalized Sampling (VS)**.8 Instead of asking for a single output, the prompt explicitly requests a distribution:

> "Analyze the conversation samples from Cluster 5. Identify 10 distinct variations of this user archetype, ranging from the 'Centroid' (typical) to 'Edge Cases' (outliers). For each variation, assign a probability of occurrence. Then, generate a detailed persona JSON for a user sampled from this distribution."

By iteratively calling this prompt and sampling based on the returned probabilities, we populate the 3,000 agent slots with a diverse population that mirrors the statistical variance of the real world, rather than just 3,000 clones of the "average user".8

### 2.4 The Persona JSON Specification

The output of this pipeline is a verified JSON object for each agent, which serves as its immutable system prompt during the simulation phase.

JSON

```
{
  "agent_id": "8f1a-2b3c",
  "archetype_cluster": "Cluster_3_Hesitant_Adopter",
  "psychographics": {
    "openness": 0.2,
    "neuroticism": 0.8,
    "technical_literacy": "Low"
  },
  "narrative_background": "You are a user who frequently struggles with hidden navigation menus. You prefer explicit text labels over icons.",
  "interaction_bias": {
    "skepticism": 0.9,
    "patience": 0.3
  }
}
```

This structure ensures that Agent 8f1a reacts to the prototype specifically as a "Hesitant Adopter," providing the granular feedback necessary for the MoA aggregation.2

---

## 3. The Cursor Architecture: Bridging IDE and Agents

Implementing this massive simulation requires a bridge between the developer's environment (Cursor) and the heavy computational runtime required for the agents.

### 3.1 The Constraint: Cursor Composer Limitations

Cursor's "Composer" is a powerful internal agent for code generation, but research indicates it lacks a public API for external orchestration.24 We cannot simply write a shell script to "drive" Composer. The control flow must be inverted: Cursor acts as the frontend interface that triggers an external backend.

### 3.2 The Model Context Protocol (MCP)

The **Model Context Protocol (MCP)** provides the standardized connection layer. By implementing a custom **MCP Server**, we expose the agent simulation capabilities as "Tools" that Cursor's internal AI can invoke.26

#### 3.2.1 Transport Layer

We utilize the **Stdio** transport layer for local execution. This allows Cursor to spawn the Python MCP server as a subprocess, communicating via standard input/output streams. This is secure, low-latency, and requires no network port configuration.26

#### 3.2.2 FastMCP Implementation

The server is built using the `fastmcp` Python library (part of the official SDK ecosystem). `fastmcp` simplifies the definition of tools and resources using decorators, abstracting the complex JSON-RPC handshake required by the protocol.28

### 3.3 Handling Long-Running Tasks (SEP-1686)

Simulating 3,000 agents is a compute-intensive operation that can take minutes. Standard synchronous HTTP/RPC calls would timeout, freezing the Cursor UI. To solve this, we implement the **MCP Tasks Primitive** (experimental feature SEP-1686).29

1. **Task Initiation:** Cursor calls the `run_advisory_board` tool.
    
2. **Immediate Acknowledgement:** The server spawns an asynchronous background worker (using Python's `asyncio.create_task`) and immediately returns a `task_id` to Cursor.31
    
3. **Progress Notification:** The background worker periodically sends `notifications/progress` messages (e.g., "Progress: 1500/3000 agents interviewed") which Cursor renders in its UI.33
    
4. **Result Polling:** Cursor periodically polls the `tasks/get` endpoint using the `task_id` to check for completion, or waits for a final completion notification.29
    

This pattern enables a responsive user experience ("fire and forget") while the heavy lifting occurs in the background.

---

## 4. Visual Verification: The "Eyes" of the Advisory Board

Design verification is inherently visual. A text-only agent cannot critique whitespace, color contrast, or layout hierarchy. The system must "see."

### 4.1 Playwright Integration via MCP

We integrate **Playwright**, a browser automation library, directly into the MCP server ecosystem. While a dedicated `mcp-server-playwright` exists 36, for this architecture, we embed Playwright logic directly into the Orchestrator to minimize inter-process overhead.

**Workflow:**

1. **Navigation:** The tool receives a URL (e.g., `http://localhost:3000`).
    
2. **Rendering:** Playwright launches a headless Chromium instance and renders the page.
    
3. **Capture:** It captures a full-page screenshot (`screenshot.png`) and potentially the Accessibility Tree (DOM snapshot) for semantic understanding.37
    

### 4.2 Vision-Language Models (VLMs) as Critics

The screenshots are passed to the Layer 1 "Jury" agents. We utilize models with strong vision capabilities, such as **GPT-4o** or **Claude 3.5 Sonnet**.38

**The Vision Prompt:**

> "You are. View this screenshot. Given your visual impairment (if applicable) and your preference for high-contrast interfaces, critique the legibility of the primary navigation. Do _not_ hallucinate buttons that are not pixels in this image."

By grounding the critique in the actual pixels rendered by Playwright, we perform **Semantic Visual Regression Testing**—detecting not just that the UI changed, but that the _usability_ has degraded for specific user segments.40

---

## 5. Execution and Consensus: The Algorithms of Agreement

This section details the algorithmic core of the system: how 3,000 disparate opinions are synthesized into a coherent report.

### 5.1 The Execution Loop

The Python MCP server orchestrates the following loop:

1. **Initialization:** Load the 3,000 Persona JSONs from the cache.
    
2. **State Capture:** Trigger Playwright to capture the current state of the prototype URL.
    
3. **Batched Parallelism:** Due to API rate limits (e.g., OpenAI's TPM), we cannot fire 3,000 requests instantly. We use `asyncio.Semaphore` to throttle concurrency (e.g., 50 concurrent requests).42
    
4. **Agent Interaction:** Each agent is invoked with the System Prompt (Persona), the User Prompt (Task), and the Image (Screenshot).
    

### 5.2 Self-Consistency Implementation

Before an agent's vote is counted, we verify its internal consistency. This improves the individual competence ($p$) required by Condorcet’s Theorem.43

**Algorithm (Per Agent):**

1. Generate $k=3$ responses with a non-zero temperature (e.g., 0.7) to encourage diverse reasoning paths.
    
2. Apply a majority vote _within_ the agent's own responses.
    
3. Only if the agent agrees with itself (e.g., 2/3 or 3/3 matches) is the vote submitted to the global pool.
    
4. If the agent is inconsistent (e.g., answers "Yes", "No", "Unsure"), its vote is discarded as "Low Confidence."
    

### 5.3 Weighted Majority Voting

Not all personas are relevant for all design aspects. A "Power User" opinion should weigh more heavily on "Advanced Settings" screens than a "Novice" opinion.

Algorithm:

$$V_{final} = \sum_{i=1}^{N} w_i \cdot v_i$$

Where $w_i$ is a dynamic weight calculated by semantic relevance:

$$w_i = \text{CosineSimilarity}(\text{Persona.Embedding}, \text{Screen.DescriptionEmbedding})$$

This ensures that the "experts" for a specific domain drive the consensus, further refining the signal.44

### 5.4 Implementing the Bayesian Truth Serum (BTS)

For subjective feedback ("Is this trustworthy?"), we use BTS to score the "honesty" of the insight.

**Python Implementation Logic:**

1. **Collect Data:** Agent $i$ gives Answer $x_i$ and Prediction $y_i$ (distribution of others' answers).
    
2. **Calculate Actual Frequency ($\bar{x}_k$):** The geometric mean of the frequencies of answer $k$.
    
3. **Calculate Geometric Mean Prediction ($\bar{y}_k$):** The geometric mean of the predicted frequencies for answer $k$.
    
4. **Score:** $Score_k = \ln(\bar{x}_k / \bar{y}_k)$. Positive scores indicate answers that are _more common than predicted_—the "Truth Serum" signal.13
    

These high-scoring answers are highlighted in the final report as "Key Insights," prioritizing them over simple majority opinions that might be generic or polite.

---

## 6. Synthesis and Reporting

The final stage is the generation of the advisory report via the Layer 3 "Adjudicator" agent.

### 6.1 Report Structure

The Adjudicator synthesizes the data into a Markdown report exposed via a Cursor Resource (`reports://latest`).

- **Executive Summary:** Pass/Fail verdict based on Condorcet threshold.
    
- **Key Friction Points:** Identified by BTS high scores.
    
- **Cluster Analysis:** Breakdown of how "Power Users" vs "Novices" reacted.
    
- **Visual Evidence:** References to specific regions of the screenshot that triggered negative sentiment.
    

### 6.2 Economic Analysis

Running this system is computationally expensive but economically viable compared to human testing.

**Cost Model (Approximate):**

- **Persona Generation:** One-time cost per project. ~$5.00 (GPT-4o).
    
- **Jury Run (3,000 Agents):**
    
    - Input: 3,000 agents * 2,000 tokens (prompt + image) = 6M tokens.
        
    - Using GPT-4o-mini ($0.15/1M): $0.90 per run.
        
    - Using GPT-4o ($2.50/1M): $15.00 per run.
        
- **Aggregation:** 50 calls * 10k tokens = 0.5M tokens. ~$1.25 (GPT-4o).
    

**Total Per-Run Cost:** ~$2.15 (using Mini for Jury) to ~$17.00 (using High-Fidelity models). This allows for daily or even per-commit runs, fundamentally changing the economics of user research.

---

## 7. Technical Implementation Guide: Building the FastMCP Server

This section provides the concrete Python code structure to implement the architecture described above.

### 7.1 Server Setup with FastMCP

We use `fastmcp` to define the server and the async task structure.

Python

```
# server.py
from fastmcp import FastMCP, Context
import asyncio
from services.persona_engine import PersonaEngine
from services.playwright_vision import VisualCritic
from services.consensus import CondorcetAggregator

# Initialize the MCP Server
mcp = FastMCP("AskElephant Advisory Board")

# Initialize Service Layers
persona_engine = PersonaEngine(log_path="./data/askelephant_logs.json")
visual_critic = VisualCritic()
aggregator = CondorcetAggregator()

@mcp.tool(task=True)
async def run_design_advisory_board(
    prototype_url: str, 
    agent_count: int = 1000,
    ctx: Context = None
) -> str:
    """
    Launches a massive multi-agent advisory board to review the prototype.
    Returns a Task ID. Use MCP Inspector or Cursor UI to track progress.
    """
    
    # 1. PERSONA GENERATION (Lazy Load)
    # Checks if personas are cached; if not, runs K-Means & Verbalized Sampling
    personas = await persona_engine.get_or_create_personas(count=agent_count)
    await ctx.info(f"Loaded {len(personas)} unique personas.")

    # 2. VISUAL CAPTURE
    # Launches Playwright to see the prototype
    screenshot_b64 = await visual_critic.capture_page(prototype_url)
    await ctx.info("Prototype captured. Initiating Jury...")

    # 3. PARALLEL EXECUTION WITH THROTTLING
    # Semaphore to prevent rate limit errors (e.g. 50 concurrent)
    semaphore = asyncio.Semaphore(50) 
    results =
    
    async def interview_agent(persona):
        async with semaphore:
            # Self-Consistency loop happens inside 'critique'
            verdict = await visual_critic.critique(persona, screenshot_b64)
            return verdict

    # 4. EXECUTION LOOP WITH PROGRESS NOTIFICATION
    total = len(personas)
    for i, persona in enumerate(personas):
        res = await interview_agent(persona)
        results.append(res)
        
        # Notify Cursor every 5%
        if i % (total // 20) == 0:
            await ctx.report_progress(i, total)
            await ctx.info(f"Interviewed {i}/{total} agents...")

    # 5. CONSENSUS & REPORTING
    await ctx.info("Aggregating votes via Condorcet & BTS...")
    final_report = await aggregator.synthesize_report(results)
    
    # Save report to expose as a Resource
    report_id = aggregator.save_report(final_report)
    
    return f"Advisory Board Adjourned. Report available at resources://reports/{report_id}"

if __name__ == "__main__":
    mcp.run()
```

### 7.2 Cursor Configuration

To connect this server to Cursor, the user must update their `mcp.json` file. Using `uv` is recommended for efficient Python dependency management.46

JSON

```
{
  "mcpServers": {
    "askelephant-advisor": {
      "command": "uv",
      "args": [
        "run",
        "--with", "fastmcp",
        "--with", "playwright",
        "--with", "openai",
        "--with", "scikit-learn",
        "path/to/server.py"
      ],
      "env": {
        "OPENAI_API_KEY": "sk-proj-..."
      }
    }
  }
}
```

### 7.3 Data Pipeline Details (PersonaEngine)

The `PersonaEngine` class encapsulates the logic for K-Means and Verbalized Sampling.

Python

```
class PersonaEngine:
    async def verbalized_sampling(self, cluster_id, n_samples):
        """
        Implements Verbalized Sampling to avoid Mode Collapse.
        Asks the LLM for a distribution, then samples from it.
        """
        prompt = f"""
        Analyze Cluster {cluster_id}. 
        Identify 5 distinct user variations in this cluster, 
        assigning a probability mass to each. 
        Output JSON with 'probability' and 'persona_details'.
        """
        distribution = await llm.generate(prompt)
        # Randomly sample 'n_samples' based on the returned probabilities
        return self.sample_from_distribution(distribution, n_samples)
```

This code ensures that if a cluster is 80% "Power Users" and 20% "Novices," the generated agents statistically reflect that breakdown.8

---

## 8. Conclusion and Future Outlook

The architecture presented in this report transforms the Cursor IDE from a tool for writing code into a platform for validating value. By leveraging **MCP** to bridge the editor with a Python-based **Mixture-of-Agents** runtime, developers can summon a 3,000-person user advisory board on demand.

The rigorous application of **Condorcet’s Jury Theorem** ensures that the aggregated signal is mathematically robust, while the **Bayesian Truth Serum** protects against the echo-chamber effects common in synthetic data. Furthermore, the use of **Playwright** and **Vision Models** ensures that the critique is grounded in the actual visual reality of the prototype, not just its code.

As Agentic Sociology matures, we anticipate this pattern—embedding massive-scale population simulations directly into the creative toolchain—will become the standard for high-reliability software engineering, effectively democratizing access to enterprise-grade user research.