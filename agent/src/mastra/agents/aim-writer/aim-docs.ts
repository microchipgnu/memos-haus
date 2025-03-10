export const aimDocs = `
# AIM (AI Markup Language)

AIM is a natural programming language that combines the simplicity of Markdown with powerful AI capabilities to create interactive and intelligent documents. It's designed to be human-readable while enabling complex AI-driven workflows and prompt-driven programming.

## Core Concepts

1. **Document Structure**
   - Written in Markdown (CommonMark specification)
   - Extended with special tags and directives (following Markdoc syntax)
   - Supports frontmatter for metadata and configuration
   - Maintains readability while enabling execution
   - Seamlessly integrates multiple programming languages

2. **Key Components**
   - **Frontmatter**: YAML metadata for document settings and inputs
   - **Nodes**: Standard Markdown elements (paragraphs, headings, lists, etc.)
   - **Tags**: Custom elements for AI and control flow
   - **Variables**: Reference values with \`$\` prefix
   - **Functions**: Built-in operations for logic and control
   - **Comments**: Standard Markdown comments for documentation

## Basic Structure

---
title: "Document Title"
description: "Document description"
input:
  - name: parameterName
    type: string
    description: "Parameter description"
    required: true
    schema:
      type: string
      default: "default value"
---

# Content

{% ai #uniqueId model="openai/gpt-4o-mini" temperature=0.7 /%}

{% $uniqueId.result %}

## Built-in Tags

1. **AI Integration (\`ai\`)**
   
   {% ai #chatbot model="openai/gpt-4o-mini" temperature=0.7 structuredOutputs={} tools="*" /%}
   
   - Required attributes:
     - \`model\`: AI model identifier (provider/model format)
   - Optional attributes:
     - \`temperature\`: Controls output randomness (0.0-1.0)
     - \`id\`: Unique identifier for referencing results
     - \`structuredOutputs\`: Schema for structured response format
     - \`tools\`: Comma-separated list of tool names or "*" for all tools

2. **Media Integration (\`media\`)**
   {% media type="image/jpeg" src="path/to/image.jpg" description="Image description" /%}
   
   - Supports images, videos, and audio files
   - Required attributes: \`type\`, \`src\`
   - Optional: \`description\`, \`id\`

3. **Control Flow**
   - Conditionals:
     {% if equals($condition, true) %}
       Content if true
     {% else equals($otherCondition, true) /%}
       Content if other condition is true
     {% else /%}
       Default content
     {% /if %}

   - Loops:
     
     {% loop #loopId items=["item1", "item2"] /%}
     {% loop #countLoop count=5 /%}
     {% loop lessThanOrEqual($value.result, 30) #loop /%}


4. **External Flows (\`flow\`)**
   {% flow #flowId path="./other-flow.md" input={key: "value"} /%}

5. **Variable Setting (\`set\`)**
   {% set #varName string="value" boolean=true number=42 array=["item1"] object={key: "value"} /%}

6. **Parallel Execution (\`parallel\`)**
   {% parallel #parallelId %}
     {% group #group1 %}
       <!-- First group of operations -->
     {% /group %}
     {% group #group2 %}
       <!-- Second group of operations -->
     {% /group %}
   {% /parallel %}

## Built-in Functions

1. **Logical Operations**
   - \`equals(value1, value2)\`: Compare values for equality
   - \`and(condition1, condition2)\`: Logical AND
   - \`or(condition1, condition2)\`: Logical OR
   - \`not(condition)\`: Logical NOT
   - \`greaterThan(value1, value2)\`: Compare if value1 > value2
   - \`lessThan(value1, value2)\`: Compare if value1 < value2
   - \`greaterThanOrEqual(value1, value2)\`: Compare if value1 >= value2
   - \`lessThanOrEqual(value1, value2)\`: Compare if value1 <= value2
   - \`includes(array, value)\`: Check if array includes value

2. **Arithmetic Operations**
   - \`add(value1, value2)\`: Addition
   - \`subtract(value1, value2)\`: Subtraction
   - \`multiply(value1, value2)\`: Multiplication
   - \`divide(value1, value2)\`: Division

3. **Utility Functions**
   - \`default(value, defaultValue)\`: Provide fallback value
   - \`debug(value)\`: Output debug information

## Code Execution


\`\`\`js {% #codeBlock %}
// JavaScript code execution with access to variables
const input = aimVariables.frontmatter.input.parameterName;
const result = \`Processed \${input}\`;
console.log("Processing:", input);
export default result;
\`\`\`
{% $codeBlock.result %}


## Supported AI Models

1. **OpenAI**
   - Format: \`openai/model-name\`
   - Examples: \`gpt-4\`, \`gpt-3.5-turbo\`, \`gpt-4-vision-preview\`

2. **Anthropic**
   - Format: \`anthropic/model-name\`
   - Examples: \`claude-3-opus\`, \`claude-3-sonnet\`, \`claude-3-haiku\`

3. **Google**
   - Format: \`google/model-name\`
   - Examples: \`gemini-pro\`, \`gemini-pro-vision\`, \`chrome-ai\`

4. **Ollama**
   - Format: \`ollama/model-name\`
   - Requires \`OLLAMA_BASE_URL\` configuration

5. **OpenRouter**
   - Format: \`provider/model-name@openrouter\`
   - Requires \`OPENROUTER_API_KEY\`

6. **OpenRouter Online**
   - Format: \`provider/model-name:online@openrouter\`
   - Requires \`OPENROUTER_API_KEY\`

## Best Practices

1. **Document Organization**
   - Use clear frontmatter for configuration
   - Structure content with proper headings
   - Use meaningful IDs for blocks
   - Include descriptive comments
   - Follow consistent file naming conventions

2. **AI Integration**
   - Set appropriate temperature for desired randomness
   - Use descriptive IDs for AI blocks
   - Chain responses thoughtfully
   - Handle errors gracefully
   - Use structured outputs when needed
   - Leverage available tools appropriately

3. **Variables and State**
   - Use descriptive variable names
   - Leverage scoping appropriately
   - Set default values when needed
   - Use debug function for troubleshooting
   - Consider variable persistence across blocks

4. **Code Integration**
   - Keep code blocks focused and minimal
   - Handle errors appropriately
   - Use exports for returning values
   - Avoid external dependencies when possible
   - Use appropriate error handling

## Common Patterns

1. **Chained AI Processing**

   {% ai #firstStep model="openai/gpt-4o-mini" /%}
   {% set #context value=$firstStep.result /%}
   {% ai #secondStep model="openai/gpt-4o-mini" context=$context /%}

2. **Dynamic Content Generation**

   {% set #userInput string="Hello" /%}
   {% ai #response %}
   Process: {% $userInput %}
   {% /ai %}

3. **Conditional Model Selection**

   {% if equals($environment, "production") %}
     {% ai #prodAI model="openai/gpt-4" /%}
   {% else /%}
     {% ai #devAI model="openai/gpt-4o-mini" /%}
   {% /if %}

4. **Structured Output Processing**
   {% ai #output model="openai/gpt-4o-mini" 
      structuredOutputs={
        recipe: "string",
        ingredients: "string[]",
        instructions: "string[]"
      } 
   /%}

## Debugging Tips

1. Use \`{% debug($variable) %}\` for inspecting values
2. Add clear comments for documentation
3. Test AI responses with different parameters
4. Validate inputs and handle edge cases
5. Use appropriate error handling in code blocks
6. Monitor execution with event handlers
7. Use the state manager for debugging complex flows

## File Management

- Use \`.aim\`, \`.aimd\`, or \`.md\` extensions
- Organize files logically in directories
- Use meaningful file names
- Include README files for documentation
- Follow consistent naming conventions
- Consider using route groups with parentheses (e.g., \`(group)\`)
- Support for dynamic routes with square brackets (e.g., \`[param]\`)
- Support for catch-all routes (e.g., \`[...param]\`)
- Support for optional catch-all routes (e.g., \`[[...param]]\`)

## Environment Setup

Required environment variables for different providers:
- \`OPENAI_API_KEY\`: For OpenAI models
- \`ANTHROPIC_API_KEY\`: For Anthropic models
- \`OLLAMA_BASE_URL\`: For Ollama models (default: "http://127.0.0.1:11434/api")
- \`OPENROUTER_API_KEY\`: For OpenRouter integration
- \`REPLICATE_API_KEY\`: For Replicate models
- \`EXA_API_KEY\`: For Exa integration
`;