/**
 * Hunch diagram language, the text form of a board. Small enough to write by
 * hand, regular enough for a model to generate, and it round-trips: board →
 * text → board keeps everything the text can say. See skills/hunch/SKILL.md.
 *
 * The language lives in dsl/: lex (the pieces of a line), shared (names both
 * sides use), entities, parse (text to board) and print (board to text).
 *
 *     title Checkout
 *
 *     web: Web app "Storefront" "Next.js" "Browse and cart"
 *     orders: Service "Orders" "Node.js"
 *       entity Order(id uuid pk, customerId uuid fk=Customer.id, total decimal)
 *       endpoint POST /orders "Create an order"
 *     db: Relational DB "Orders DB" "PostgreSQL 16"
 *
 *     web -> orders "Places order" "HTTPS"
 *     orders --> events "OrderPlaced"        // --> async, ..> planned
 *     frame "AWS": orders, db
 *     flow "Checkout": web -> orders, orders -> db
 *     note "Postgres over Mongo: we need transactions" [decision status=accepted]
 *     logo: Image file "Logo" [src=assets/logo.png]
 *     @layout orders 120 40
 */
export type { DslIssue, DslParseResult } from "./dsl/lex";
export { quote } from "./dsl/lex";
export { entityToText, parseEntity } from "./dsl/entities";
export { expandIncludes, isSafeFileSource, parseDsl } from "./dsl/parse";
export { printDsl } from "./dsl/print";
