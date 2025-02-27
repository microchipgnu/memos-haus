// run this with bun run src/lib/core/agent/manual-run.ts

import { updateState } from "./workflow";
import type { Role } from "@11labs/client";

const memos = [
    { id: "memo1", name: "Shopping List", content: "1. Milk\n2. Eggs\n3. Bread\n4. Coffee" },
    { id: "memo2", name: "Meeting Notes", content: "Team sync discussion points:\n- Project timeline review\n- Budget updates\n- Next sprint planning" },
    { id: "memo3", name: "Todo Tasks", content: "- Complete project documentation\n- Review pull requests\n- Schedule team meeting\n- Update status report" },
    { id: "memo4", name: "Recipe", content: "Chocolate Chip Cookies:\n- 2 cups flour\n- 1 cup butter\n- 2 eggs\n- 1 cup chocolate chips" },
    { id: "memo5", name: "Contact Info", content: "John Doe\nEmail: john@example.com\nPhone: (555) 123-4567" }
];

const messages = [
    { message: "I need an AIM flow that can generate recipes", source: "user" as Role },
    { message: "Go ahead...", source: "ai" as Role },
];

const response = await updateState(messages, memos);

console.log("RESPONSE", JSON.stringify(response, null, 2));