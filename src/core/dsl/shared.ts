/** Names the reader and the writer of the Hunch language share: the kinds of note. */
import type { ComponentData, NoteData, NoteType } from "@/lib/types";

export const NOTE_TYPES: NoteType[] = ["decision", "question", "out-of-scope", "comment"];
export const NOTE_COLOR: Record<NoteType, NoteData["color"]> = { decision: "blue", question: "pink", "out-of-scope": "green", comment: "yellow" };

export interface ComponentDecl {
  line: number;
  key: string;
  data: ComponentData;
  tags?: string[];
}
