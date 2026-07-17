import type { Provider } from "@/content/types";
import type { CalloutData } from "./callout";
import type { Tone } from "./tones";

/*
 * All provider-specific content for the NoSQL Database lesson. The interactive
 * components under this folder are provider-agnostic and read everything they
 * render from here, so the AWS and Azure lessons stay bespoke without
 * duplicating the interaction machinery. The two providers genuinely diverge in
 * the resource hierarchy (a flat DynamoDB table versus an account, database, and
 * container in Cosmos DB), the key model (partition key plus sort key versus
 * partition key plus id), indexing (you define secondary indexes in DynamoDB,
 * while Cosmos DB indexes every property by default), read consistency (two
 * modes versus five levels), and the throughput currency (separate RCU and WCU
 * versus a single Request Unit).
 *
 * Facts verified against Amazon DynamoDB documentation (docs.aws.amazon.com) and
 * Microsoft Learn (learn.microsoft.com). Relative cost and distribution figures
 * are illustrative, not price quotes. Prose is neutral and professional; no em
 * dashes (house rule).
 */

/* ----------------------------- Chapter framing ---------------------------- */

export interface ChapterMeta {
  navLabel: string;
  kicker: string;
  title: string;
  intro: string;
}

/* --------------------------- Chapter 0 · records -------------------------- */

export interface ItemAttribute {
  name: string;
  value: string;
}

export interface RecordItem {
  /** React key and detail selection id. */
  id: string;
  /** The partition-key value this item carries. */
  partitionValue: string;
  /** The sort-key value (DynamoDB) or item id (Cosmos DB). */
  sortValue: string;
  /** Free-form, per-item attributes beyond the key. */
  attributes: ItemAttribute[];
}

export interface ItemModelContent {
  tableTerm: string;
  tableName: string;
  /** The scope shown under the table name (Region, or account and database). */
  scopeLabel: string;
  partitionKeyTerm: string;
  partitionKeyName: string;
  sortKeyTerm: string;
  sortKeyName: string;
  /** How the provider names the item's unique key as a whole. */
  primaryKeyLabel: string;
  items: RecordItem[];
  hint: string;
  note: string;
  /** The create command, showing that only the key schema is declared. */
  cli: string;
  callouts: CalloutData[];
}

/* ------------------------- Chapter 1 · partitions ------------------------- */

export interface PartitionStrategy {
  id: string;
  label: string;
  keyName: string;
  /** Values hashed into partitions; skew and cardinality drive the outcome. */
  sampleKeys: string[];
  verdict: string;
}

export interface PartitioningContent {
  /** How many partitions the router spreads keys across. */
  partitionCount: number;
  intro: string;
  strategies: PartitionStrategy[];
  note: string;
  callouts: CalloutData[];
}

/* --------------------------- Chapter 2 · access --------------------------- */

export interface AccessPattern {
  id: string;
  label: string;
  /** The request in one line. */
  request: string;
  /** The mechanism the store uses, e.g. "Point read" or "Scan". */
  methodLabel: string;
  /** Efficiency tone: ok (cheap), warn (costlier), hot (avoid at scale). */
  tone: Tone;
  /** Short relative cost label. */
  cost: string;
  why: string;
  /** How the provider handles indexing for this pattern. */
  indexNote: string;
}

export interface AccessContent {
  intro: string;
  patterns: AccessPattern[];
  callouts: CalloutData[];
}

/* ------------------------- Chapter 3 · consistency ------------------------ */

export interface ConsistencyLevel {
  id: string;
  name: string;
  tone: Tone;
  isDefault: boolean;
  guarantee: string;
  tradeoff: string;
  use: string;
}

export interface ConsistencyContent {
  label: string;
  intro: string;
  /** Ordered strongest to most relaxed. */
  levels: ConsistencyLevel[];
  note: string;
  callouts: CalloutData[];
}

/* -------------------------- Chapter 4 · capacity -------------------------- */

export interface CapacityMode {
  id: string;
  name: string;
  isDefault?: boolean;
  billing: string;
  bestFor: string;
}

export interface CapacityOp {
  id: string;
  label: string;
  /** Cost in the provider's throughput currency. */
  cost: string;
  tone: Tone;
  detail: string;
}

export interface CapacityContent {
  unitName: string;
  unitIntro: string;
  modes: CapacityMode[];
  ops: CapacityOp[];
  note: string;
  callouts: CalloutData[];
}

/* ---------------------------- Chapter 5 · quiz ---------------------------- */

export interface QuizQ {
  q: string;
  opts: string[];
  answer: number;
  explain: string;
}

/* ------------------------------ The bundle -------------------------------- */

export interface LessonContent {
  chapters: ChapterMeta[];
  itemModel: ItemModelContent;
  partitioning: PartitioningContent;
  access: AccessContent;
  consistency: ConsistencyContent;
  capacity: CapacityContent;
  quiz: QuizQ[];
}

/* ================================ AWS ==================================== */

const AWS: LessonContent = {
  chapters: [
    {
      navLabel: "records",
      kicker: "Chapter 1",
      title: "Keys, items, and the shape of a record",
      intro:
        "A DynamoDB table has no fixed columns. You store items, each a bag of attributes, and the only structure the table enforces is the primary key. Pick an item to see its key and its free-form attributes.",
    },
    {
      navLabel: "partitions",
      kicker: "Chapter 2",
      title: "How one key spreads data across machines",
      intro:
        "DynamoDB hashes the partition key to decide which physical partition stores each item. That is what lets a table scale without limit, and it is also how a poor key creates a hot spot. Try a few partition keys and watch the distribution.",
    },
    {
      navLabel: "access",
      kicker: "Chapter 3",
      title: "Query the key, or scan everything",
      intro:
        "You do not write arbitrary SQL here. Reads are fast when they target a key and slow when they do not. Run a few access patterns and see which are cheap, which need an index, and which fall back to a Scan.",
    },
    {
      navLabel: "consistency",
      kicker: "Chapter 4",
      title: "How fresh is a read",
      intro:
        "A distributed store must choose between the freshest answer and the fastest one. DynamoDB gives you two read modes. Compare them.",
    },
    {
      navLabel: "capacity",
      kicker: "Chapter 5",
      title: "Paying for reads and writes",
      intro:
        "Throughput is the thing you actually pay for. DynamoDB meters it in capacity units and offers two modes for provisioning them. Explore the units and the modes.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 6",
      title: "Check yourself",
      intro:
        "Five questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  itemModel: {
    tableTerm: "Table",
    tableName: "Music",
    scopeLabel: "Region us-east-1 · one flat table",
    partitionKeyTerm: "Partition key",
    partitionKeyName: "Artist",
    sortKeyTerm: "Sort key",
    sortKeyName: "SongTitle",
    primaryKeyLabel: "Composite primary key (Artist + SongTitle)",
    items: [
      {
        id: "a1",
        partitionValue: "No One You Know",
        sortValue: "My Dog Spot",
        attributes: [
          { name: "AlbumTitle", value: "Hey Now" },
          { name: "Genre", value: "Country" },
          { name: "Price", value: "1.98" },
        ],
      },
      {
        id: "a2",
        partitionValue: "No One You Know",
        sortValue: "Somewhere Down The Road",
        attributes: [
          { name: "Genre", value: "Country" },
          { name: "Year", value: "1984" },
        ],
      },
      {
        id: "a3",
        partitionValue: "The Acme Band",
        sortValue: "Look Out, World",
        attributes: [
          { name: "AlbumTitle", value: "The Buck Starts Here" },
          { name: "Genre", value: "Rock" },
        ],
      },
      {
        id: "a4",
        partitionValue: "The Acme Band",
        sortValue: "Still in Love",
        attributes: [
          { name: "Genre", value: "Rock" },
          { name: "Price", value: "2.47" },
          { name: "PromotedUntil", value: "2015-07-31" },
        ],
      },
    ],
    hint: "Items are grouped by their partition key. Pick one to see the full primary key and the attributes unique to it.",
    note: "Only the primary key is fixed. Every item under an artist shares the Artist partition key and is ordered by its SongTitle sort key, but each item carries whatever other attributes it needs. DynamoDB validates the key, not a column list.",
    cli: "aws dynamodb create-table --table-name Music --attribute-definitions AttributeName=Artist,AttributeType=S AttributeName=SongTitle,AttributeType=S --key-schema AttributeName=Artist,KeyType=HASH AttributeName=SongTitle,KeyType=RANGE --billing-mode PAY_PER_REQUEST",
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "A table has fixed columns like SQL.",
        body: "Only the primary key is fixed. Every other attribute is per item: two items in the same table can carry completely different attributes, and DynamoDB never checks them against a schema. Items can even nest attributes up to 32 levels deep.",
      },
      {
        kind: "note",
        tag: "Ordering",
        title: "The sort key gives order within a partition.",
        body: "Items that share a partition key value form an item collection, stored together and sorted by the sort key. That is what makes 'all songs by this artist, titles A through K' a single efficient Query rather than a table scan.",
      },
    ],
  },
  partitioning: {
    partitionCount: 5,
    intro:
      "DynamoDB feeds the partition key value into an internal hash function; the output picks the partition. A key with many distinct, evenly used values spreads load across partitions. A key with few values, or one hot value, piles traffic onto a single partition.",
    strategies: [
      {
        id: "user",
        label: "Partition by userId",
        keyName: "userId",
        sampleKeys: [
          "u-1041",
          "u-2277",
          "u-3390",
          "u-4471",
          "u-5502",
          "u-6613",
          "u-7724",
          "u-8835",
          "u-9946",
          "u-1058",
          "u-2169",
          "u-3270",
        ],
        verdict:
          "High cardinality: many distinct values, no single hot user. Load spreads across partitions and the table scales cleanly.",
      },
      {
        id: "status",
        label: "Partition by status",
        keyName: "status",
        sampleKeys: [
          "ACTIVE",
          "ACTIVE",
          "ACTIVE",
          "ACTIVE",
          "ACTIVE",
          "ACTIVE",
          "ACTIVE",
          "PENDING",
          "ACTIVE",
          "ACTIVE",
          "CLOSED",
          "ACTIVE",
        ],
        verdict:
          "Low cardinality and skewed: almost everything is ACTIVE, so one partition takes most of the traffic while the others sit nearly idle.",
      },
      {
        id: "constant",
        label: "Partition by a constant",
        keyName: '"LOG"',
        sampleKeys: [
          "LOG",
          "LOG",
          "LOG",
          "LOG",
          "LOG",
          "LOG",
          "LOG",
          "LOG",
          "LOG",
          "LOG",
          "LOG",
          "LOG",
        ],
        verdict:
          "A single value hashes to a single partition. Every request lands on one partition, which throttles no matter how much capacity the table has.",
      },
    ],
    note: "Bars show where each sample key hashes. Distinct values spread across partitions; repeated values stack onto the same one. Choose a partition key with a large number of distinct, evenly accessed values.",
    callouts: [
      {
        kind: "fix",
        tag: "The trap",
        title:
          "A hot partition throttles even when the table has spare capacity.",
        body: "Throughput is spread across partitions. If most requests target one partition-key value, that partition can throttle while the rest sit idle. Adaptive capacity absorbs short bursts, but it is not a substitute for a key with many evenly used values.",
      },
    ],
  },
  access: {
    intro:
      "DynamoDB is fast when a read targets a key and expensive when it does not. Each pattern below is a real request; see how the store serves it and what it costs.",
    patterns: [
      {
        id: "point",
        label: "Get one song by artist and title",
        request: "GetItem with Artist and SongTitle",
        methodLabel: "Point read",
        tone: "ok",
        cost: "Cheapest",
        why: "Both parts of the primary key are supplied, so DynamoDB goes straight to the one item.",
        indexNote: "Uses the full composite primary key. No index needed.",
      },
      {
        id: "query",
        label: "List all songs by one artist",
        request: "Query where Artist = 'The Acme Band'",
        methodLabel: "Query",
        tone: "ok",
        cost: "Efficient",
        why: "The partition key alone selects the item collection; results come back ordered by sort key.",
        indexNote:
          "A Query on the partition key returns the whole item collection, optionally ranged by sort key.",
      },
      {
        id: "index",
        label: "Find every song of a given genre",
        request: "Query where Genre = 'Rock'",
        methodLabel: "Secondary index",
        tone: "warn",
        cost: "Needs an index",
        why: "Genre is not part of the primary key, so the base table cannot answer this efficiently.",
        indexNote:
          "Create a global secondary index keyed on Genre, then Query the index. Reads from a GSI are eventually consistent.",
      },
      {
        id: "scan",
        label: "Count Rock songs with no key at all",
        request: "Scan the table, filter Genre = 'Rock'",
        methodLabel: "Scan",
        tone: "hot",
        cost: "Reads everything",
        why: "With no key to narrow it, DynamoDB reads every item and filters afterward.",
        indexNote:
          "A Scan reads the entire table and consumes capacity for all of it. Avoid at scale; add an index instead.",
      },
    ],
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "You can query any attribute like a SQL WHERE clause.",
        body: "Not efficiently. Queries must target the partition key. To filter by a non-key attribute you either add a secondary index keyed on it, or fall back to a Scan that reads the whole table. Design your keys and indexes around the questions you will ask.",
      },
    ],
  },
  consistency: {
    label: "Read consistency",
    intro:
      "When you read an item, do you need the very latest value, or is a slightly stale one fine for less cost? DynamoDB lets you decide per request.",
    levels: [
      {
        id: "strong",
        name: "Strongly consistent",
        tone: "strong",
        isDefault: false,
        guarantee:
          "Returns the most up-to-date data, reflecting every write that succeeded before the read.",
        tradeoff:
          "Higher latency and twice the read cost. Not available on global secondary indexes or streams.",
        use: "Reads that must never be stale: account balances, inventory counts, a value you just wrote.",
      },
      {
        id: "eventual",
        name: "Eventually consistent",
        tone: "relaxed",
        isDefault: true,
        guarantee:
          "May not reflect a very recent write; repeat the read a moment later and it converges to the latest value.",
        tradeoff:
          "The default. Lowest latency and half the cost of a strongly consistent read.",
        use: "Most reads: feeds, timelines, listings, anything that tolerates a brief lag.",
      },
    ],
    note: "DynamoDB offers exactly these two modes. Set ConsistentRead=true for a strong read; leave it off (the default) for an eventually consistent one. All reads from a global secondary index or a DynamoDB stream are eventually consistent.",
    callouts: [
      {
        kind: "note",
        tag: "Per request",
        title: "Strong reads are chosen per call, and not everywhere.",
        body: "Consistency is a parameter on the read, not a property of the table. Set ConsistentRead=true when a read must be current; leave it off for the cheaper default. Strongly consistent reads are not supported on global secondary indexes or streams.",
      },
    ],
  },
  capacity: {
    unitName: "Capacity units (RCU and WCU)",
    unitIntro:
      "DynamoDB prices reads and writes in capacity units defined by item size. For an item up to 4 KB, one read capacity unit (RCU) is one strongly consistent read per second, or two eventually consistent reads. One write capacity unit (WCU) is one write per second for an item up to 1 KB. Larger items round up to the next unit.",
    modes: [
      {
        id: "on-demand",
        name: "On-demand",
        isDefault: true,
        billing:
          "Pay per request with no capacity to set. Scales itself from a few requests to millions per second.",
        bestFor:
          "The default and recommended mode: new, spiky, or unpredictable workloads.",
      },
      {
        id: "provisioned",
        name: "Provisioned",
        billing:
          "You set RCU and WCU per second and pay hourly for them, used or not. Auto scaling can adjust them toward a target utilization.",
        bestFor:
          "Steady, predictable traffic you can forecast, for a lower rate than on-demand.",
      },
    ],
    ops: [
      {
        id: "read-strong",
        label: "Strongly consistent read, item up to 4 KB",
        cost: "1 RCU",
        tone: "warn",
        detail: "The baseline strong read unit for an item of 4 KB or less.",
      },
      {
        id: "read-eventual",
        label: "Eventually consistent read, item up to 4 KB",
        cost: "0.5 RCU",
        tone: "ok",
        detail: "Half the cost of a strong read, and the default read mode.",
      },
      {
        id: "write-1kb",
        label: "Write an item up to 1 KB",
        cost: "1 WCU",
        tone: "warn",
        detail:
          "Writes are metered in 1 KB units, from a pool separate from reads.",
      },
      {
        id: "write-3kb",
        label: "Write a 3 KB item",
        cost: "3 WCU",
        tone: "hot",
        detail: "Larger items round up: a 3 KB item costs three write units.",
      },
    ],
    note: "Reads and writes draw on separate pools (RCU and WCU). Because the unit cost is fixed by size class, you can budget capacity before a single request runs.",
    callouts: [
      {
        kind: "note",
        tag: "Which mode",
        title: "On-demand is the default; provisioned is for predictable load.",
        body: "On-demand needs no capacity planning and scales itself, which fits most workloads. Switch to provisioned when traffic is steady enough to forecast, to pay a lower rate for reserved throughput. You can move a table between modes.",
      },
    ],
  },
  quiz: [
    {
      q: "In DynamoDB, what does the partition key determine?",
      opts: [
        "The column names allowed in each item",
        "The physical partition an item is stored in, via a hash function",
        "The order items come back from a Scan",
        "The table's provisioned throughput",
      ],
      answer: 1,
      explain:
        "DynamoDB hashes the partition key value to pick the physical partition that stores the item. A well-chosen key has many distinct, evenly used values so items spread across partitions.",
    },
    {
      q: "Two items share the partition key Artist but have different SongTitle sort keys. Together they are:",
      opts: [
        "A global secondary index",
        "An item collection, stored together and sorted by sort key",
        "A hot partition",
        "A composite table",
      ],
      answer: 1,
      explain:
        "Items sharing a partition key value form an item collection, stored close together and ordered by the sort key. A single Query can return the whole collection, optionally ranged by sort key.",
    },
    {
      q: "You need to fetch songs by Genre, which is not part of the primary key. The efficient approach is:",
      opts: [
        "Run a Scan and filter on Genre",
        "Create a global secondary index keyed on Genre and query it",
        "Rename the table's partition key to Genre in place",
        "Enable strongly consistent reads",
      ],
      answer: 1,
      explain:
        "A global secondary index gives Genre its own key space so you can Query by it. A Scan reads the entire table, and you cannot change a base table's primary key in place.",
    },
    {
      q: "By default, a DynamoDB read is:",
      opts: [
        "Strongly consistent",
        "Eventually consistent, at half the cost of a strong read",
        "Blocked until you attach a cache",
        "Only available through an index",
      ],
      answer: 1,
      explain:
        "Eventually consistent is the default and costs half of a strongly consistent read. Set ConsistentRead=true when a read must reflect all prior successful writes.",
    },
    {
      q: "In on-demand capacity mode you:",
      opts: [
        "Must set RCU and WCU up front",
        "Pay per request with no capacity to plan, and it scales automatically",
        "Can run only eventually consistent reads",
        "Are limited to a single partition",
      ],
      answer: 1,
      explain:
        "On-demand is the default serverless mode: no capacity planning, pay per request, automatic scaling. Provisioned mode is the alternative when traffic is predictable enough to forecast.",
    },
  ],
};

/* =============================== Azure =================================== */

const AZURE: LessonContent = {
  chapters: [
    {
      navLabel: "records",
      kicker: "Chapter 1",
      title: "Keys, items, and the shape of a record",
      intro:
        "A Cosmos DB container has no fixed schema. You store items, each a JSON document, and the only structure required is a partition key and an id. Pick an item to see its key and its free-form properties.",
    },
    {
      navLabel: "partitions",
      kicker: "Chapter 2",
      title: "How one key spreads data across machines",
      intro:
        "Cosmos DB routes each item to a logical partition by its partition key value, then spreads logical partitions across physical ones. That is what lets a container scale out, and how a skewed key creates a hot spot. Try a few partition keys and watch the distribution.",
    },
    {
      navLabel: "access",
      kicker: "Chapter 3",
      title: "Query the key, or scan everything",
      intro:
        "Cosmos DB indexes every property by default, so any filter works, but not every query is cheap. Run a few access patterns and see which stay inside one partition and which fan out across many.",
    },
    {
      navLabel: "consistency",
      kicker: "Chapter 4",
      title: "How fresh is a read",
      intro:
        "A globally distributed store must trade freshness against speed. Cosmos DB gives you five well-defined levels instead of two. Walk the ladder.",
    },
    {
      navLabel: "capacity",
      kicker: "Chapter 5",
      title: "Paying for reads and writes",
      intro:
        "Throughput is the thing you pay for, and Cosmos DB measures all of it in one currency: the Request Unit. Explore the unit, the operations that spend it, and the provisioning modes.",
    },
    {
      navLabel: "check",
      kicker: "Chapter 6",
      title: "Check yourself",
      intro:
        "Five questions on the model you just built. Answer to reveal the explanation.",
    },
  ],
  itemModel: {
    tableTerm: "Container",
    tableName: "music",
    scopeLabel: "Account acmemusic · Database catalog",
    partitionKeyTerm: "Partition key",
    partitionKeyName: "/artist",
    sortKeyTerm: "Item id",
    sortKeyName: "id",
    primaryKeyLabel: "Partition key + id (unique in the logical partition)",
    items: [
      {
        id: "a1",
        partitionValue: "No One You Know",
        sortValue: "my-dog-spot",
        attributes: [
          { name: "albumTitle", value: "Hey Now" },
          { name: "genre", value: "Country" },
          { name: "price", value: "1.98" },
        ],
      },
      {
        id: "a2",
        partitionValue: "No One You Know",
        sortValue: "somewhere-down-the-road",
        attributes: [
          { name: "genre", value: "Country" },
          { name: "year", value: "1984" },
        ],
      },
      {
        id: "a3",
        partitionValue: "The Acme Band",
        sortValue: "look-out-world",
        attributes: [
          { name: "albumTitle", value: "The Buck Starts Here" },
          { name: "genre", value: "Rock" },
        ],
      },
      {
        id: "a4",
        partitionValue: "The Acme Band",
        sortValue: "still-in-love",
        attributes: [
          { name: "genre", value: "Rock" },
          { name: "price", value: "2.47" },
          { name: "tags", value: "[promoted, single]" },
        ],
      },
    ],
    hint: "Items are grouped by their partition key. Pick one to see the full key and the properties unique to it.",
    note: "Only the partition key and id are required. Every item under an artist shares the /artist partition key and has an id unique within that logical partition, but each item carries whatever other properties it needs. There is no sort-key dimension: you order results with ORDER BY on any indexed property.",
    cli: 'az cosmosdb sql container create --account-name acmemusic --database-name catalog --name music --partition-key-path "/artist" --throughput 400',
    callouts: [
      {
        kind: "myth",
        tag: "Common mix-up",
        title: "Every item in a container has the same fields.",
        body: "Containers are schema agnostic. Items sharing a partition key can have completely different shapes. Only the partition key and the id are required, and Cosmos DB automatically indexes the rest without you declaring any schema.",
      },
      {
        kind: "note",
        tag: "Uniqueness",
        title: "id is unique within a logical partition, not globally.",
        body: "The item's true key is the partition key value plus its id. Two items in different logical partitions may share an id. Unlike DynamoDB there is no separate sort key; you order query results with ORDER BY on any indexed property.",
      },
    ],
  },
  partitioning: {
    partitionCount: 5,
    intro:
      "Cosmos DB groups items that share a partition key value into a logical partition, then maps logical partitions onto physical ones. A key with many distinct, evenly used values spreads load. A key with few values, or one dominant value, concentrates it on a single partition.",
    strategies: [
      {
        id: "user",
        label: "Partition by /userId",
        keyName: "/userId",
        sampleKeys: [
          "u-1041",
          "u-2277",
          "u-3390",
          "u-4471",
          "u-5502",
          "u-6613",
          "u-7724",
          "u-8835",
          "u-9946",
          "u-1058",
          "u-2169",
          "u-3270",
        ],
        verdict:
          "High cardinality: many distinct values, no single hot user. Logical partitions spread across physical partitions and the container scales cleanly.",
      },
      {
        id: "status",
        label: "Partition by /status",
        keyName: "/status",
        sampleKeys: [
          "active",
          "active",
          "active",
          "active",
          "active",
          "active",
          "active",
          "pending",
          "active",
          "active",
          "closed",
          "active",
        ],
        verdict:
          "Low cardinality and skewed: nearly everything is active, so one logical partition takes most of the traffic while the others stay nearly idle.",
      },
      {
        id: "constant",
        label: "Partition by /type",
        keyName: "/type",
        sampleKeys: [
          "log",
          "log",
          "log",
          "log",
          "log",
          "log",
          "log",
          "log",
          "log",
          "log",
          "log",
          "log",
        ],
        verdict:
          "A single value is one logical partition. Every request lands on one partition, which throttles at 10,000 RU/s and caps at 20 GB no matter how much throughput the container has.",
      },
    ],
    note: "Bars show where each sample key hashes. Distinct values spread across partitions; repeated values stack onto one. Choose a partition key with a wide range of values, since each logical partition is limited to 20 GB and 10,000 RU/s.",
    callouts: [
      {
        kind: "fix",
        tag: "The trap",
        title: "Throughput is split evenly across physical partitions.",
        body: "Provisioned RU/s divides among physical partitions. A skewed partition key sends most requests to one partition, which can throttle while the rest are idle. A logical partition also caps at 20 GB, so a low-cardinality key can hit a storage wall as well as a throughput one.",
      },
    ],
  },
  access: {
    intro:
      "Cosmos DB indexes every property, so any filter returns results. What varies is cost: an in-partition query is cheap, and a query that spans partitions is not. Each pattern below is a real request.",
    patterns: [
      {
        id: "point",
        label: "Get one song by artist and id",
        request: "Point read with partition key and id",
        methodLabel: "Point read",
        tone: "ok",
        cost: "Cheapest",
        why: "The partition key and id together identify exactly one item, so Cosmos reads it directly.",
        indexNote: "A point read by partition key and id costs about 1 RU.",
      },
      {
        id: "query",
        label: "List all songs by one artist",
        request: "SELECT * FROM c WHERE c.artist = 'The Acme Band'",
        methodLabel: "In-partition query",
        tone: "ok",
        cost: "Efficient",
        why: "The filter is on the partition key, so the query stays inside a single logical partition.",
        indexNote:
          "Filtering on the partition key keeps the query in one partition. Order results with ORDER BY on any indexed property.",
      },
      {
        id: "index",
        label: "Find every song of a given genre",
        request: "SELECT * FROM c WHERE c.genre = 'Rock'",
        methodLabel: "Cross-partition query",
        tone: "warn",
        cost: "Costs more RUs",
        why: "genre is indexed automatically, so this works with no setup, but it must fan out across partitions.",
        indexNote:
          "No secondary index to define: every property is indexed by default. But spanning partitions costs more RUs than an in-partition query.",
      },
      {
        id: "scan",
        label: "Scan with an unindexed or complex filter",
        request: "A query with no partition-key filter over all items",
        methodLabel: "Full cross-partition scan",
        tone: "hot",
        cost: "Highest",
        why: "With nothing to narrow it, the query fans out to every partition and reads broadly.",
        indexNote:
          "A query with no partition-key filter fans out to all partitions and consumes the most RUs. Filter on the partition key to avoid it.",
      },
    ],
    callouts: [
      {
        kind: "note",
        tag: "The catch",
        title: "Automatic indexing does not make every query cheap.",
        body: "Because Cosmos DB indexes every property by default, a filter on any field returns results with no extra setup. But a query that spans logical partitions still fans out and costs more RUs than an in-partition query. Filter on the partition key whenever you can.",
      },
    ],
  },
  consistency: {
    label: "Consistency level",
    intro:
      "Cosmos DB is globally distributed, so a read must trade freshness against latency, cost, and availability. It offers five well-defined levels, set as an account default and tunable per request.",
    levels: [
      {
        id: "strong",
        name: "Strong",
        tone: "strong",
        isDefault: false,
        guarantee:
          "Linearizability: every read returns the most recent committed write. A client never sees a partial or uncommitted write.",
        tradeoff:
          "Highest latency; reads cost about twice the RUs. Writes commit across regions before returning.",
        use: "When any stale read is unacceptable and the account can pay the latency.",
      },
      {
        id: "bounded",
        name: "Bounded staleness",
        tone: "strong",
        isDefault: false,
        guarantee:
          "Reads lag the latest write by at most a chosen number of versions (K) or a time interval (T).",
        tradeoff:
          "Also about twice the read RU cost; you pick the staleness bound.",
        use: "Global apps that need near-strong reads with a predictable, bounded lag.",
      },
      {
        id: "session",
        name: "Session",
        tone: "key",
        isDefault: true,
        guarantee:
          "Within a client session you read your own writes, and your reads never go backward in time.",
        tradeoff:
          "The default. The strongest of the relaxed levels, at relaxed-level cost and latency.",
        use: "The most common choice: a user always sees their own updates.",
      },
      {
        id: "prefix",
        name: "Consistent prefix",
        tone: "relaxed",
        isDefault: false,
        guarantee:
          "Reads never see writes out of order. You may see an older state, but never one that skips a write.",
        tradeoff: "Relaxed-level cost and latency.",
        use: "When order matters more than freshness: replaying a sequence of updates.",
      },
      {
        id: "eventual",
        name: "Eventual",
        tone: "relaxed",
        isDefault: false,
        guarantee:
          "Reads may arrive out of order and lag; given no new writes, replicas converge over time.",
        tradeoff: "Lowest latency and cost, highest availability.",
        use: "Unordered, freshness-tolerant reads: like counts, view tallies, telemetry.",
      },
    ],
    note: "Most distributed NoSQL databases offer only strong and eventual. The three levels between them, bounded staleness, session, and consistent prefix, are the distinctive part of Cosmos DB. Session is the account default, and any read can override the default.",
    callouts: [
      {
        kind: "fix",
        tag: "The default",
        title: "Session, not Strong, is the default.",
        body: "New accounts default to Session consistency: you read your own writes at relaxed-level cost. You can tighten to Bounded staleness or Strong, or relax to Consistent prefix or Eventual, at the account level or per request. The two strongest levels roughly double read RU cost.",
      },
    ],
  },
  capacity: {
    unitName: "Request Units (RU/s)",
    unitIntro:
      "Cosmos DB normalizes every operation, read, write, or query, into a single currency: the Request Unit. A point read of a 1 KB item costs 1 RU. You provision or consume throughput as request units per second (RU/s), and every response reports the RUs it actually charged.",
    modes: [
      {
        id: "provisioned",
        name: "Provisioned (manual)",
        billing:
          "You set RU/s on a container, or share it across a database. Minimum 400 RU/s, changed in increments of 100. Billed hourly for what you provision.",
        bestFor: "Steady, predictable traffic.",
      },
      {
        id: "autoscale",
        name: "Autoscale",
        billing:
          "Cosmos scales RU/s instantly with usage, up to a maximum you set, so you do not pay peak rates during quiet periods.",
        bestFor:
          "Variable or unpredictable traffic that still needs guaranteed scale.",
      },
      {
        id: "serverless",
        name: "Serverless",
        billing:
          "No throughput to provision. You pay only for the RUs your operations actually consume.",
        bestFor: "Intermittent or light workloads, and development.",
      },
    ],
    ops: [
      {
        id: "read-point",
        label: "Point read of a 1 KB item",
        cost: "1 RU",
        tone: "ok",
        detail: "The reference operation: one Request Unit.",
      },
      {
        id: "read-strong",
        label: "Read at Strong or Bounded staleness",
        cost: "~2 RU",
        tone: "warn",
        detail:
          "Strong and bounded-staleness reads cost about twice the RUs of the relaxed levels.",
      },
      {
        id: "write",
        label: "Write an item (all properties indexed)",
        cost: "Higher",
        tone: "warn",
        detail:
          "A write costs more than a point read, and rises with item size and the number of indexed properties.",
      },
      {
        id: "cross",
        label: "Cross-partition query",
        cost: "Highest",
        tone: "hot",
        detail:
          "Fanning out across partitions and returning many items costs the most RUs. Filter on the partition key to stay in one.",
      },
    ],
    note: "One currency covers reads, writes, and queries. Because Cosmos DB charges the RUs an operation actually uses, cost tracks the real work: item size, indexed properties, consistency level, and query complexity.",
    callouts: [
      {
        kind: "fix",
        tag: "One currency",
        title: "RU/s covers reads, writes, and queries alike.",
        body: "Unlike separate read and write units, Cosmos DB meters everything in Request Units. Larger items, more indexed properties, stronger consistency, and more complex queries all raise the RU charge for an operation. You can provision RU/s manually, let autoscale move it, or go serverless.",
      },
    ],
  },
  quiz: [
    {
      q: "What is the correct resource hierarchy in Azure Cosmos DB?",
      opts: [
        "Container, then database, then account, then item",
        "Account, then database, then container, then item",
        "Database, then account, then container, then item",
        "Account, then container, then database, then item",
      ],
      answer: 1,
      explain:
        "An account holds databases, a database holds containers, and a container holds items. The container is the unit of scale, and it is where you set the partition key.",
    },
    {
      q: "What uniquely identifies an item in a Cosmos DB container?",
      opts: [
        "The id alone, across the whole account",
        "The partition key value together with the item id",
        "The container name",
        "A dedicated sort key",
      ],
      answer: 1,
      explain:
        "The partition key routes the item to a logical partition, and the id is unique within that partition. Combined, partition key plus id is the item's unique index. There is no separate sort key.",
    },
    {
      q: "You filter a query on a property that is not the partition key. By default:",
      opts: [
        "It fails until you create a secondary index",
        "It works, because every property is indexed, but spanning partitions costs more RUs",
        "It returns no results",
        "It forces Strong consistency",
      ],
      answer: 1,
      explain:
        "Cosmos DB automatically indexes every property, so the filter works with no extra setup. But a cross-partition query fans out and costs more RUs than an in-partition query; filter on the partition key when you can.",
    },
    {
      q: "Which consistency level is the default for a new Cosmos DB account?",
      opts: ["Strong", "Eventual", "Session", "Bounded staleness"],
      answer: 2,
      explain:
        "Session is the default: within a client session you read your own writes at relaxed-level cost. Cosmos DB offers five levels from Strong to Eventual, tunable at the account or per request.",
    },
    {
      q: "In Azure Cosmos DB, throughput and operation cost are measured in:",
      opts: [
        "Separate read and write capacity units",
        "Request Units (RU/s), one currency for reads, writes, and queries",
        "Gigabytes stored per month",
        "The number of containers",
      ],
      answer: 1,
      explain:
        "Cosmos DB normalizes every operation into Request Units. A 1 KB point read is 1 RU; writes, larger items, stronger consistency, and complex queries cost more. You provision or consume RU/s.",
    },
  ],
};

/* ================================ Export ================================= */

export const CONTENT: Record<Provider, LessonContent> = {
  aws: AWS,
  azure: AZURE,
};
