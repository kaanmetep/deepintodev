---
title: "How JavaScript Works Behind the Scenes"
subtitle: "Moving past the abstraction and hidden layers of JavaScript to understand the brilliant system working in the background"
author: "Kaan Peksen"
---

## Introduction

When writing code, most of the time we never think about the hidden layers involved. You write some code, hit save, and _it just works_. It feels seamless. But have you ever paused to think about how much work is actually happening in that split second? Your computer does not understand JavaScript. It does not know what a variable or a function is. To the machine, it is all just text. Yet, somehow, the engine translates your code into action instantly. It is not magic. **It is a brilliant system working in the background.**

You might (or might not) have heard about the concepts, algorithms, and data structures used to translate your code _into something the machine understands_. It does not matter if you faced this in an interview, discussed it with a friend, or simply tried to learn it on your own. Explaining the inner workings of JavaScript is rarely a simple task. You might have picked up a few pieces along the way, but the full picture likely never quite clicked in your head.

**Here is the truth:** it is not your fault if you do not have a complete answer. Right now, there is simply **too much abstraction**. There are so many libraries, frameworks, build tools, and magic layers stacked on top of each other that keeping track of every single detail is almost impossible. In fact, most of the time, you probably did not even care how it really works as long as it paid the bills.

But if you want to understand this _once and for all_, if you want to feel truly confident, crush those job interviews, and impress your friends with your knowledge, you are in the right place. We will start from **ground zero**. We will walk through everything that happens inside your computer to make JavaScript work. I will not use fancy jargon, and we will not skip over anything as 'magic.' We are not going to simply say, _"JavaScript somehow handles this in the background,"_ and move on. We will go step by step and explain every detail.

In the **first chapter**, we will see how JavaScript translates our human-readable code into something machines can understand. This process is vital because English words mean nothing to a machine. In the **second chapter**, we will see how JavaScript operates perfectly fine on a _single thread_. We will answer questions like: What does a single thread actually mean? Why is it a "problem" in the real world? And how does JavaScript solve it behind the scenes? All of these concepts are crucial to understanding how your code works.

## 1. How JavaScript _Translates_ Your Code

We have to start by asking the right questions. If we want to learn how a simple line like `let number = 5` turns into **raw machine instructions** that the computer can execute, we first need to understand how that translation actually happens. Once we have an answer to that, we can discuss how JavaScript organizes code, how it prioritizes tasks, and how it manages requests to other websites. But before any of that, we must figure out how the process of turning English words into 1s and 0s really works.

So, we need to take the JavaScript file containing our code and feed it into _some kind of machine_ that understands it and translates it into machine code. In this context, that machine is the **V8 Engine**, which is used by Google Chrome and Node.js.

Basically, the **V8 Engine** acts as a _translator_. It takes a JavaScript file as input and turns it into something computers can understand. Everything happens inside this engine where your code is parsed, compiled, and executed. All the critical tasks, such as memory management, the call stack, and the execution of your logic, are handled by the engine itself. In other words, V8 is the environment that turns your JavaScript into real actions on the computer.

Let's start from the very beginning. Let's say we have a website called `www.example.com`. This website contains the HTML structure shown in **Listing 1.1**, which includes a script named `script.js`.

----------------------------


```javascript
<!DOCTYPE html>
<html>
    <head>
    ...
    <script src="script.js"></script>
    </head>
    <body>
    </body>
</html>
```
**Listing 1.1:** _Basic HTML structure linking a JavaScript file._

Let's say we want to visit this website. You type `www.example.com` into your browser and hit enter. The server responds by sending the HTML file. Once received, your browser uses the **HTML Parser** to analyze the content. This parser is a fundamental component that reads the raw HTML code and transforms it into a meaningful structure while the page is loading.

As the HTML Parser moves through the code, it eventually hits our script tag. It then fetches the `script.js` file, either from the network or the cache. No matter the source, what the browser actually receives is a **stream of bytes**.

When we say a "stream of bytes," we are simply talking about raw binary data. It is a long sequence of 8-bit values like `01001000...` or numbers such as `72 101 108`. At this specific stage, the browser is completely blind to your logic. It does not see keywords, functions, or variables yet. It only sees a pile of numbers waiting to be decoded into readable text (usually via **UTF-8**, which we will cover shortly). This is exactly where the **Byte Stream Decoder** enters the scene. Its job is to take that raw binary data and translate it into actual characters that the JavaScript engine can process.

Right now, the Byte Stream Decoder is holding onto these raw bytes. On their own, they are just numbers without context. The decoder needs to convert them into meaningful text that can be processed in the next stages. Basically, it is turning raw data into the source code that will eventually become `tokens`. We can represent this byte stream in a few ways, such as binary or hexadecimal. To make this clear, let’s imagine our decoder has just received the following sequence: `66 75 6e 63 74 69 6f 6e` (represented in hexadecimal).

Now, the decoder has to convert these bytes into actual letters based on the encoding system. For example, if we are using UTF-8, the decoder reads each byte value and interprets it according to that standard. A byte like `0x66` is looked up in the encoding rules and mapped to a specific Unicode code point, which ultimately becomes a character in the text. **This process is deterministic, meaning the same byte sequence will always produce the exact same characters under the same encoding.**

But what exactly is **UTF-8**? At its core, it is a character encoding standard that defines how raw bytes translate into visible characters. It allows text from almost every language to be represented using sequences of one or more bytes. Think of it as a comprehensive mapping system that tells the computer exactly which character corresponds to a specific byte sequence. For many common characters, particularly in English, UTF-8 uses just a single byte and follows the same mapping as ASCII. Take a look at **Figure 1.1** to see a snapshot of how this encoding system works.

![](/images/book-how-javascript-works-behind-the-scenes/ascii-codes.png)
**Figure 1.1:** _A snapshot of the UTF-8 mapping table._

As you can see in the table, the first byte in our example (`0x66`) corresponds to the letter `f`. Since we are using hexadecimal notation, we simply look for `66` in the 'Hex' column to find its match. This is effectively the job of the **Byte Stream Decoder**. It reads the raw bytes, interprets them using the selected encoding, and transforms them into a stream of _characters_ (like `f`, `u`, `n`...).

> **Note:** If you are curious to dig a little deeper into encoding, here is an interesting detail. In the wild (on servers and hard drives), JavaScript files are almost exclusively encoded in **UTF-8** because it is compact and efficient for transfer. However, the internal mechanics of JavaScript engines actually operate based on **UTF-16**. This means the Byte Stream Decoder performs a crucial, silent translation. It consumes the compact UTF-8 bytes from the network and converts them into the UTF-16 code units that the engine expects. This preference for UTF-16 is largely a historical legacy. Back in the mid-90s when JavaScript was created, using 16-bit units was considered the perfect balance for performance and supporting global languages. That decision is still baked into the language's core today.

-------------------

Thanks to the **Byte Stream Decoder**, we now have characters instead of a raw **stream of bytes**. However, individual characters alone are still not enough; the engine needs words, not just letters.

This is where the **Tokenizer** (also known as the _Scanner_) enters the scene. It takes the stream of characters and groups them into meaningful chunks. Think of it like reading a sentence: you recognize distinct words and punctuation marks rather than just seeing a pile of letters. These chunks are called **tokens**, which are the smallest meaningful units that the JavaScript engine can understand. You can see a visual representation of these generated tokens in **Figure 1.2**.

![](/images/book-how-javascript-works-behind-the-scenes/bytestreamdecoder.png)
**Figure 1.2:** _From characters to tokens: grouping the input._

Just like that, our stream of characters has transformed into the word `function`. As you likely know, `function` is a specific **keyword** in JavaScript. The entire goal of this process is to extract these keywords, symbols, and identifiers from the raw text so the code can be understood structurally.

But how does the system actually _know_ that `function` is a keyword? This isn’t something the engine guesses or learns at runtime. The rules are strictly defined by the JavaScript specification. The language explicitly lists reserved words and dictates exactly how they must be recognized.
This is why attempting to name a variable `let function = 5` causes the engine to throw an error:

`Uncaught SyntaxError: Unexpected token 'function'`

It recognizes `function` as a reserved command, not a valid variable name. The **Tokenizer** repeats this scanning process for every character it receives, eventually building a complete list of tokens. You can see a sequence of these generated tokens in **Figure 1.3**.

![](/images/book-how-javascript-works-behind-the-scenes/tokens.png)
**Figure 1.3:** _A sequence of tokens generated by the Tokenizer._

As the Tokenizer generates these tokens, it hands them off to the next major player on the scene: the **Parser**. The Parser is a core component of the JavaScript engine. Its primary job is to take the stream of tokens from the Tokenizer and transform them into a meaningful, hierarchical structure known as an **Abstract Syntax Tree (AST)**.

An **Abstract Syntax Tree (AST)** is a specialized data structure that represents your code in a hierarchical, tree-like form. Each point (or _node_) in this tree corresponds to a specific construct in the language, such as a variable declaration, an arithmetic operation, or a function body. The relationships between these nodes explain exactly how the code is nested. Why do we need this? Because a flat list of tokens is not enough to understand context, precedence, or scope. The AST makes these relationships explicit. It turns a linear sequence of words into a structured map that the engine can easily analyze, transform, and execute.

-------------------

This Abstract Syntax Tree, constructed by the Parser, is essentially the blueprint of your code. It captures the logic, the variables, and the structure in a way the machine can process. To make this concept concrete, let's look at a simplified version of an AST in **Figure 1.4**.

![](/images/book-how-javascript-works-behind-the-scenes/syntaxtree.png)
**Figure 1.4:** _A simplified view of an Abstract Syntax Tree._

At this point, it is important to clarify where names like `FunctionDeclaration`, `BlockStatement`, or `BinaryExpression` come from. These are **not** produced by the Tokenizer. The Tokenizer’s job ends once characters are converted into raw tokens. These distinct node types are introduced by the **Parser** itself. While tokens are just a flat stream of labeled text (keywords, identifiers, operators), the Parser applies the language’s grammar rules to understand the relationships between them. Based on these rules, it builds higher-level constructs and classifies them into specific AST node types.

Crucially, this is also the checkpoint for **syntax errors**. Remember, individual tokens can be valid on their own, but their arrangement might be **structurally invalid** or **meaningless** to the engine. The Parser ensures that not only are the words correct, but the _sentence structure_ follows the rules of JavaScript. If the tokens don't fit the grammar, the process halts, and an error is thrown.

----------------

Let's pause for a moment to recap where we stand. It started when the **HTML Parser** encountered a `<script>` tag and **triggered a network request** to fetch the file. Once the server responded, the incoming **stream of raw bytes** flowed into the JavaScript Engine.

The **Byte Stream Decoder** acted as the first point of contact, translating those raw bytes into a consistent stream of characters. Crucially, this character stream was not stored as a whole file; instead, it was fed directly into the **Scanner** (Tokenizer). The Scanner grouped these characters into syntactic "tokens" (like `function`, `const`, or `{`), which were then handed off to the Parser to construct the **Abstract Syntax Tree (AST)**.

At this stage, your code is no longer a flat list of text; it has been transformed into a hierarchical data structure that fully represents the logic and grammar of your program. You can see the entire roadmap of this progress in **Figure 1.5**.
![](/images/book-how-javascript-works-behind-the-scenes/JS.png)
**Figure 1.5:** _A visual summary of the parsing pipeline._

With the Abstract Syntax Tree (AST) fully constructed, the engine moves to the execution phase. This task falls to the **Ignition Interpreter**, a critical component within V8.

----------------

The **Ignition Interpreter** serves as the engine's first line of execution. It traverses the AST nodes and translates them into a compact, intermediate format known as **bytecode**. Bytecode acts as an abstraction of machine code. Think of it as a strategic middle ground between the high-level code we write and the raw binary instructions a machine executes. One of its most powerful features is that it is **machine agnostic**. This means the generated bytecode is universal. It can run on any architecture, whether it is an x64 server or an ARM-based mobile phone, without modification. (It is worth noting, however, that converting bytecode to real machine code is significantly more efficient if the bytecode is designed with a computational model similar to the underlying CPU.)

You can visualize this hierarchy and exactly where bytecode fits in **Figure 1.6**.

![](/images/book-how-javascript-works-behind-the-scenes/machinecode.png)
**Figure 1.6:** _Bytecode: The bridge between High-Level Language and Machine Code._

Technically, Ignition performs a _tree traversal_, walking through the AST nodes one by one. For every node it visits, it emits the corresponding **opcodes**. You can think of an **opcode** as a single piece of instruction, while **bytecode** is the complete stream formed by combining these pieces. This process effectively flattens the AST’s branching structure into a linear, compact stream of instructions that is ready to be executed.

Generating bytecode is only half the story; Ignition is also responsible for **executing** it. Once the bytecode is ready, the interpreter immediately starts running the instructions line by line. This allows your application to start up incredibly fast, without waiting for the lengthy process of compiling everything into machine code first. (It performs other tasks as well, but we will discuss those shortly.)

And actually, this bytecode doesn't have to be a magical thing to us. We can actually see the bytecode that gets generated and understand it very well, which we will do right now! Now, let's create a file called `script.js` and write the function shown in **Listing 1.2**.

```
function calc(obj) {
  const value = 10 + obj.x;
  return value + obj.y + obj.z;
}

calc({ x: 2, y: 3, z: 4 });
```

**Listing 1.2:** _A simple JavaScript function for bytecode analysis._

If you want to see the bytecode that will be generated, open your terminal and execute:

```
node --print-bytecode --print-bytecode-filter=calc script.js
```

---------------------------

Here is the raw bytecode you should see in your terminal, shown in **Listing 1.3**:

```
Frame size 16
   38 S> 000000DC51F034F8 @    0 : 0d 0a             LdaSmi [10]
         000000DC51F034FA @    2 : c8                Star1
   47 E> 000000DC51F034FB @    3 : 2f 03 00 01       GetNamedProperty a0, [0], [1]
   41 E> 000000DC51F034FF @    7 : 3b f8 00          Add r1, [0]
         000000DC51F03502 @   10 : c9                Star0
   72 S> 000000DC51F03503 @   11 : 2f 03 01 03       GetNamedProperty a0, [1], [3]
   66 E> 000000DC51F03507 @   15 : 3b f9 05          Add r0, [5]
         000000DC51F0350A @   18 : c8                Star1
   80 E> 000000DC51F0350B @   19 : 2f 03 02 06       GetNamedProperty a0, [2], [6]
   74 E> 000000DC51F0350F @   23 : 3b f8 08          Add r1, [8]
   82 S> 000000DC51F03512 @   26 : ae                Return
Constant pool (size = 3)
000000DC51F03491: [TrustedFixedArray]
 - map: 0x0171958c09a9 <Map(TRUSTED_FIXED_ARRAY_TYPE)>
 - length: 3
       0: 0x0171958c4d41 <String[1]: #x>
       1: 0x0171958c4d59 <String[1]: #y>
       2: 0x0171958c4d71 <String[1]: #z>
Handler Table (size = 0)
Source Position Table (size = 18)
0x00dc51f03519 <Other heap object (TRUSTED_BYTE_ARRAY_TYPE)>
```

**Listing 1.3:** _Raw bytecode output generated by V8._

The output might look like cryptic assembly language at first glance, but don't be intimidated. These are simply the instructions that make your JavaScript code work. We will go through each line step by step so that you can clearly understand what bytecode is and how to read it.

Before we go into the details of the bytecode, first let's make sure we leave no questions behind. You might have heard of **registers** before, but if you haven't, think of these as ultra-fast, tiny workspaces located directly inside the **CPU** (processor), not in your RAM or hard drive. They are physically right where the action happens, holding the specific pieces of data the processor is working on _at this exact nanosecond_ because fetching data from RAM would simply be too slow.

The **V8 Ignition** interpreter is actually designed as a **register machine**, meaning it mimics this hardware architecture entirely in software. So, when Ignition generates bytecode, it allocates **virtual registers** (like the `r0` and `r1` we saw) to temporarily hold values between steps. By doing this, it effectively simulates—at a high level—how a real CPU works.

When you inspect the bytecode output, you might see the first line saying `Frame size 16`. This is where the concept of 'virtual registers' meets reality. The **Frame** is essentially the specific slice of memory that V8 reserves to execute this function. But why exactly 16? This number is directly tied to the registers we just discussed. Since registers like `r0` and `r1` are software simulations, they need a physical place in RAM to live. On a standard 64-bit system, each register slot requires **8 bytes** of space. The math is straightforward:

**2 registers (`r0`, `r1`) × 8 bytes = 16 bytes**

So, when you see `Frame size 16`, it is effectively V8 telling the computer: _"Hey, I need to use 2 virtual registers here, so please clear 16 bytes of space on the stack for me to store them."_

To make sense of the bytecode instructions, we need to distinguish between the three main types of registers used by Ignition. Each serves a distinct role in the execution flow:

- **General Purpose Registers (`r0`, `r1`, `r2`...):** These are the engine's primary workspace for local storage. They function as temporary slots that can hold any type of value—numbers, strings, or object references. If your code declares local variables or needs to store an intermediate result during a complex calculation, these registers are where that data lives.

- **Argument Registers (`a0`, `a1`, `a2`...):** These registers are strictly reserved for the inputs passed into a function. `a0` holds the first argument, `a1` holds the second, and so on. They allow the function to access the data sent from the caller.

- **The Accumulator:** This is the most critical component—think of it as the JavaScript VM's "working hand." It is the default location for input and output. Most bytecode instructions operate by reading a value from the accumulator, modifying it, and placing the result back into the accumulator. It is the central hub where the immediate action takes place before the result is moved to a more permanent register.

If the definitions didn't fully click yet, don't worry at all. You will see exactly how every register is used as we step through the code. First, let’s decode the header information provided at the very top:

```
       0: 0x0171958c4d41 <String[1]: #x>
       1: 0x0171958c4d59 <String[1]: #y>
       2: 0x0171958c4d71 <String[1]: #z>
```

The string references you see in the bytecode reveal exactly how the engine manages property names like `x`, `y`, and `z` (remember, we passed an object containing these properties in **Listing 1.2**). When the JavaScript engine processes your code, it stores these object property names as string literals within a special list called the **Constant Pool**. Even though you write `obj.x`, at the bytecode level, the engine needs to look up the string `"x"` to find the value.

Here is the critical part for reading the bytecode: The instructions don't usually say _"get x"_; they refer to the **index** where `"x"` is stored in that pool. Based on our example:

- **Index [0]:** maps to `"x"`

- **Index [1]:** maps to `"y"`

- **Index [2]:** maps to `"z"`

So, when we analyze the instructions, if you see a reference to `[0]`, you will know it is talking about the property `x`. Now, with these references in mind, let's go back to the first line of the bytecode:

`38 S> 000000DC51F034F8 @    0 : 0d 0a LdaSmi [10]`

Think of the left side as the engine's navigation coordinates. It displays the exact **memory address** where this instruction lives, the **current position** (or offset) in the byte stream (indicated by `@ 0`), and the **raw hex code** that the machine actually reads. Essentially, this section links the human-readable text on the right to the physical data in memory. However, for the purpose of understanding _how_ the code executes, we won't be focusing on this metadata. The real logic and action are happening on the right side.

`LdaSmi [10]`. This line stands for **Load Small Integer**. It instructs the engine to take the integer value `10` and load it directly into the **Accumulator**. As we mentioned, the accumulator is the engine's primary workspace. By executing this instruction, the value `10` is now sitting in that workspace, ready to be used. To ensure we don't get lost, we will track the state of the registers at every step.

Here is the current snapshot of our engine:

```
Accumulator Register: 10
```

Now, looking at the second line, we see: `Star1`. This stands for **Store Accumulator in Register 1**. It instructs the engine to take the value currently sitting in the Accumulator (`10`) and copy it into the register `r1`. This acts as a "save" operation. Since the Accumulator is about to be used for a new calculation, we need to safely store our current value (`10`) in `r1` so we don't lose it.

**Current Register State:**

```
Accumulator Register: -
Register1: 10
```

On the third line, we see: `GetNamedProperty a0, [0], [1]`. This instruction tells the engine to retrieve a specific property from an object. **`a0`**: This points to our first argument (the object we passed to the function). **`[0]`**: This is the index in the Constant Pool we discussed earlier, which corresponds to the property name **"x"**. **`[1]`**: This is a feedback vector index. For now, you can ignore this; it is used by the engine for optimization purposes, and **we will discuss exactly how this works in detail later in the book.**

In short, this line looks at the object in `a0`, finds the value assigned to `x`, and places it into the **Accumulator**. Since we passed an object where `x` was `10`, the Accumulator is updated with that value.

**Current Register State:**

```
Accumulator Register: 2
Register1: 10
```

Next, we encounter: `Add r1, [0]`. This instruction tells the engine to take the value stored in register **`r1`** (which is `10`) and add it to the current value in the **Accumulator** (which is the value of `obj.x` we just fetched). **`r1`**: Contains `10`. **Accumulator**: Contains the value of `obj.x` (let's say it was `2`). **`[0]`**: Again, this is a feedback vector index used for optimization, which we will cover later.

The `Add` operation performs the math and, most importantly, **stores the result back into the Accumulator.**

**Current Register State:**

```
Accumulator Register: 12
Register1: 10
```

Next, we see: `Star0`.

This stands for **Store Accumulator in Register 0**. Following the addition we just performed, the engine takes the resulting value currently sitting in the **Accumulator** and copies it into register **`r0`**.

---------------------

**Current Register State:**

```
Accumulator Register: -
Register1: 10
Register0: 12
```

Next, we see: `GetNamedProperty a0, [1], [3]`. This follows the same logic as the previous property lookup. The engine is instructed to go back to the object stored in **`a0`** and fetch the value for the property at **Index [1]** of our Constant Pool which corresponds to **"y"**.

The value of `obj.y` is then loaded directly into the **Accumulator**, overwriting the previous result that was sitting there. This is exactly why we used `Star0` in the previous step; if we hadn't saved the previous result to `r0`, it would have been lost now.

**Current Register State:**

```
Accumulator Register: 3
Register1: 10
Register0: 12
```

Next, we have: `Add r0, [5]`. This instruction tells the engine to take the value we saved earlier in register **`r0`** (which was the result of `10 + obj.x`) and add it to the current value sitting in the **Accumulator** (`obj.y`).

The result of this addition is then stored back into the **Accumulator**.

**Current Register State:**

```
Accumulator Register: 15
Register1: 10
Register0: 12
```

--------------------

Next, we see: `Star1`. Even though we used `r1` earlier to store the constant `10`, the engine now reuse it to store our new progress. It takes the current value from the **Accumulator** -the sum of `(10 + obj.x) + obj.y`- and copies it into register **`r1`**.

This is a classic example of **register reuse**. To keep the "Frame size" (the memory footprint) as small as possible, the engine doesn't just keep creating new registers (like `r3`, `r4`, etc.); it recycles the ones it no longer needs for their original purpose.

**Current Register State:**

```
Accumulator Register: -
Register1: 15
Register0: 12
```

Next, we see: `GetNamedProperty a0, [2], [6]`. Just as before, the engine reaches back into our parameter object stored in **`a0`**. This time, it looks for the property at **Index [2]** of the Constant Pool, which we know is **"z"**.

**Current Register State:**

```
Accumulator Register: 4
Register1: 15
Register0: 12
```

Finally, we reach the last calculation: `Add r1, [8]`. This instruction takes the total we've been building up in register **`r1`**-which represents `(10 + obj.x + obj.y)`- and adds it to the value currently in the **Accumulator** (`obj.z`).

------------------

The engine performs the final addition and places the complete result back into the **Accumulator**.

**Current Register State:**

```
Accumulator Register: 19
Register1: 15
Register0: 12
```

The final step is the **`Return`** instruction. In V8's bytecode, the `Return` instruction is very specific: it always returns the value currently sitting in the **Accumulator**. Because our final calculation result was already placed in the Accumulator by the last `Add` instruction, the engine doesn't need to do any extra work. It simply ends the function's execution and hands that value back to the part of your code that called the function.

To put it all together, here is the complete sequence of bytecode instructions that V8 generated for our logic. Think of this as the "behind the scenes" script that Ignition follows line-by-line:

```js
function calc(obj) {
  const value = 10 + obj.x; // LdaSmi [10], Star1, GetNamedProperty a0, [0], [1], Add r1, [0], Star0
  return value + obj.y + obj.z; // GetNamedProperty a0, [1], [3], Add r0, [5], Star1, GetNamedProperty a0, [2], [6], Add r1, [8], Return
}
```

I haven't explicitly shown the **`a0`** register in our diagrams to keep things simple and avoid confusion. However, as we discussed at the very beginning, the **'a'** registers are dedicated to holding the **arguments** (parameters) passed into a function. So, when the bytecode says `GetNamedProperty a0`, it is telling the engine to look at the object stored in that parameter register. The Accumulator then pulls the specific property value from the object inside **`a0`**.

Now, let’s finally go back to those mystery numbers I told you to 'nevermind' earlier. If you look at the bytecode again, you'll see them **at the end** of almost every line:

`GetNamedProperty a0, [0], [1]`

We see `[0]` refers to our property index. But what about that `[1]` on the right side? Or when we see `Add r1, [0]`, why is there sometimes a `[0]` or a `[5]` following our registers?

Clearly, these values inside the square brackets are **not** the values of the registers themselves. These are called **Feedback Vector Indices**, and they are a vital part of **V8's optimization technique.** These indices act as pointers to specific slots where the engine stores 'observations' about your code, which it later uses to transform this slow bytecode into high-speed machine code. Now, let's see how that really happens exactly.

This is where **TurboFan** enters the chat. Remember when we mentioned that the Ignition interpreter doesn't just run your code, but also does 'other things' we'd discuss later? We were referring to TurboFan. While Ignition executes your code, it performs a critical task: **Profiling**. It acts like a spy, gathering intelligence on which functions are 'hot' (run frequently) and what kind of data is flowing through them (e.g., 'Is this variable always an integer?'). It stores all this intel in the **Feedback Vectors**. This data is essential because the optimizing compiler, **TurboFan**, will rely entirely on these notes later to generate high-performance machine code.

V8 is smart; it doesn't want to waste energy optimizing code that only runs once. To avoid this, it monitors the execution count. As we discussed, if a function is called repeatedly, it gets flagged as **'hot'**. However, frequency alone isn't enough; V8 also looks for **stability**. If you call a function 100 times, and every single time you pass the exact same object structure (like `{x, y, z}`), V8 gets excited. It realizes that your code is predictable. On the other hand, if your code is chaotic -passing different object shapes every time- V8 prefers to keep it in the Ignition interpreter. It won't waste time trying to optimize a "moving target" that changes too often to be reliably predicted.

Once a function is marked **'hot'** and **'stable'**, TurboFan steps in and reviews the Feedback Vector notes we collected earlier. It makes a bold move. Based on the notes in a slot like `[5]`, it says: _"I see you've only ever added integers here. I'm going to generate machine code that ONLY knows how to add integers."_ By stripping away all the complex checks for strings, objects, or weird edge cases, this new machine code becomes incredibly lean. It no longer has to ask "What type is this?" at runtime, it just performs the math. This allows your JavaScript to run almost as efficiently as low-level **C++** code.

However, JavaScript is a dynamic language, and promises can be broken. If your type assumptions later become invalid -for example, if a different object shape suddenly appears- V8 may perform a **'Deoptimization'** (often called a 'bailout'). It throws away that super-fast generated code, goes back to the Feedback Vector to update the notes (_'Alert: User is now sending strings!'_), and hands execution back to the slower Ignition interpreter. This process is expensive, which is why writing high-performance code means trying to avoid changing types or object shapes dynamically.

![](/images/book-how-javascript-works-behind-the-scenes/JSLAST 1.png)
**Figure 1.7**: _The V8 Execution Pipeline (Ignition & TurboFan)_

This is the very definition of **Just-In-Time (JIT)** compilation. Unlike languages that are compiled before you ever run them, V8 waits to see how your code behaves in the real world before committing to a high-performance version. It essentially learns "on the fly." By combining the **Ignition** interpreter (which starts your code instantly) with the **TurboFan** compiler (which optimizes it later based on actual data), V8 gives you the best of both worlds: a fast start and a high-speed finish.

We’ve thrown a lot of heavy concepts at you all at once, so it’s completely normal if your brain feels a bit fried by now. Let’s take a moment to decompress and clear up any still unresolved questions you might have.

Here is the core concept: **Bytecode does not go to your CPU as "commands"; it goes to the program (the Interpreter) as "data".** Interpreter (Ignition) that is a program written in C++ that has already been compiled into machine code (1s and 0s) long ago. **Your CPU is currently executing that Interpreter program natively**. Bytecode is not "Executable Code" for the CPU. It is a map for the Interpreter to read. You can visualize the Interpreter (Ignition) as a giant `Switch - Case` structure running inside the engine. You can imagine that your CPU is already running code like the one shown in Listing 1.4:

```
// THIS CODE IS ALREADY CONVERTED TO MACHINE CODE AND THE CPU IS RUNNING IT
void Interpreter(byteCodeCommand) {

    switch (byteCodeCommand) {

        case 'ADD':
            // To the CPU: "Go add these two registers" (The REAL Machine Code is here)
            CPU_Perform_Addition();
            break;

        case 'PRINT':
            // To the CPU: "Draw pixels on screen" (The REAL Machine Code is here)
            CPU_Write_To_Screen();
            break;

        // ... thousands of other commands
    }
}
```

**Listing 1.4**: _A conceptual example illustrating how the Interpreter executes instructions._

When Bytecode 'ADD' arrives we don't convert this specific 'ADD' into 1s and 0s and throw it at the CPU. Instead, The Interpreter function, which is _already running on the CPU_, sees the 'ADD' case and triggers its own internal `CPU_Perform_Addition` machine code. **However**, when TurboFan (the compiler) steps in for the 'hot' code, it _does_ actually generate new, raw 1s and 0s. It takes that specific 'ADD' instruction and bakes it directly into a custom block of machine code, so the CPU can execute it instantly next time without needing the Interpreter to look it up ever again.

Since C++ (the language Ignition is written in) is a **compiled language**, the code you write gets translated directly into raw machine code (1s and 0s) before it ever reaches the user. This means the CPU runs it natively without needing a middleman. So, this might bring up a question: Could we write an interpreter like Ignition using JavaScript itself, instead of C++?

The answer is yes, absolutely. In Computer Science, writing a language's interpreter in the language itself is called a **'Meta-Circular Evaluator.'** You could write a JavaScript engine entirely in JavaScript. However, there is a massive performance trade-off due to the Layer of Abstraction. The V8 Engine, written in C++, reads your code and interacts directly with the CPU, making it **extremely fast**. In contrast, an interpreter written in JavaScript reads your code but must pass those instructions through the V8 engine first, which _then_ talks to the CPU. This extra layer makes it significantly slower (a great real-world example of this is the **JS-Interpreter** by Neil Fraser).

So, we finally have a machine capable of reading our code. But that brings us to the next question: _how_ does it actually read it? Does it simply start at the first line and keep going one by one? In a sense, that’s true. But if you’ve ever heard that **'JavaScript is a single-threaded language,'** you know that assumption needs a bit more nuance. Strictly speaking, being **single-threaded** means the JavaScript runtime relies on a single **Main Thread** of execution.

In technical terms, the engine can execute only **one instruction at a time** on a single CPU core. Unlike multi-threaded languages that can split tasks across multiple cores to process them in parallel, JavaScript is natively **synchronous** and **sequential**. This means Operation A must complete its execution entirely before the processor can even fetch the instruction for Operation B. There is no parallel processing happening within the engine's core logic; it is just one straight line of execution.

**Figure 1.8**: _The Single-Threaded Execution Model_

However, the real world is unfortunately not all sunshine and rainbows. We simply cannot afford to have a single operation block the entire execution flow. For instance, consider making a network request to fetch data from a slow API; in a strictly synchronous world, **your entire application would effectively freeze** and become unresponsive until that server finally responds.

In this next chapter, we will learn exactly how the V8 engine _handles this problem_ and _orchestrates_ your code.

## 2. How JavaScript _Orchestrates_ Your Code

V8 JavaScript Engine allocates two distinct regions in your computer's memory (RAM) to handle the workload. **These are the engine's two main architectural components:** the **Memory Heap** and the **Call Stack**.

The **Memory Heap** is a large, **unstructured** region of memory. Whenever you define variables, objects, or arrays, the engine allocates space for them inside this massive pool. Think of it as a free-form storage space where data is scattered rather than stacked in order. However, since the Heap is purely responsible for _storage_ and not for _execution_, let’s put it aside for a moment and focus on the Call Stack, the place where the actual single-threaded action happens.

The **Call Stack**, on the other hand, is the brain of the operation. Unlike the unstructured Heap, the Stack is highly organized and follows a strict **LIFO (Last In, First Out)** data structure. Its job is to track exactly _where_ we are in the code execution. Whenever a function is invoked, the engine **(specifically the Ignition interpreter)** 'pushes' it onto the top of the stack. When the function finishes its job, it gets **'popped'** off. Since we have only **one** Call Stack, the engine can only be at the top of the stack processing one function at a time, **this is the very definition of being single-threaded**. Let’s walk through a code example to see this 'Push' and 'Pop' action in slow motion.

Let's walk through the execution of the code in Figure 2.1.

```js
console.log("First");
console.log("Second");
```

**Figure 2.1:** _The sample code used to demonstrate the execution flow._

Before the engine (specifically the **Ignition Interpreter**, I will use these terms interchangeably) can even execute that first line (`console.log("First")`), it performs a crucial setup step. It creates an environment known as the **Execution Context**.

You should visualize the Execution Context as a **specific allocation of memory in your RAM**. It is a distinct region where the engine stores the state -such as variables, arguments, and references- required to execute a specific chunk of code. Basically, your code cannot run until this physical memory space is allocated and configured by the engine. There are two types of Execution Contexts you need to know about:

1. **Global Execution Context (GEC):** This is the default, base execution context. The moment your file loads, the engine creates this. It's the "Main Stage." No matter how massive your project is, there is always **only one** Global Execution Context.

2. **Function Execution Context (FEC):** This is where things get interesting. Every time a function is **invoked** (called), the engine creates a brand new execution context specifically for that function. If you call a function 10 times? You get 10 separate Execution Contexts. Each one has its own private space for variables and its own arguments.

Let's get back to our example. Since our code snippet isn't inside any function, it automatically resides in the default wrapper, **Global Execution Context (GEC)**. If we were to x-ray the memory right before that first line runs, this Global Context would look something like this invisible object:

```js
Global_Execution_Context = {
  // 1. Variable Object (The Data Store)
  // The 'console' object exists here because it's part of the global 'window'
  VariableObject: {
    window: <Global Object>,
    console: <Reference to Native Code>,
    // If we had variables like 'var a = 10', they would live here too.
  },

  // 2. The 'this' keyword
  this: window,

  // 3. Link to Outer Environment
  OuterReference: null // Nothing exists outside the global scope
}
```

So, where do these Execution Contexts go once they are created? They don't just float around in random memory space. This is exactly what the **Call Stack** is for. The Call Stack is literally a stack of these Execution Contexts. In fact, technically speaking, the Call Stack is also known as the **'Execution Context Stack'**. When the engine creates a new context, it **pushes** that context right onto the top of the stack. When the function finishes running, the engine **pops** that context off, destroying it and returning control to the context below it. So for our code, basically;

The engine encounters `console.log("First")`. Since this is a function invocation, a new Execution Context is created specifically for this `log` function. This context is **pushed** onto the top of the Call Stack (right above the Global Context). The function executes, prints "First" to the console, and once it finishes, it is immediately **popped** off the stack and destroyed.The engine moves to the second line: `console.log("Second")`. It’s the same story all over again. A brand new Execution Context is created for this call, **pushed** onto the stack, executed, and then **popped** off.

---------------

So far so good. Now, let's consider the code shown in Listing 2.2.

```js
console.log("1. Request sent to Netflix Server...");

// Simulating a network request that takes 2 seconds
setTimeout(() => {
  console.log("2. Movie data arrived from Server!");
}, 2000);

console.log("3. Continue rendering the rest of the page...");
```

**Listing 2.2:** _The sample code used to demonstrate the execution flow._

If the engine actually stopped and waited for that network request to finish, your entire program would be **completely frozen**. No scrolling, no clicking, just a stuck screen. To avoid this disaster, JavaScript uses some tools. And first of these tools that we're going to learn is **WEB APIs.**

Strictly speaking, Web APIs are **NOT** part of the JavaScript engine itself. Instead, they are separate "superpowers" provided by the **Browser environment** (like Chrome or Firefox) that surround the engine. While your JavaScript engine is busy running code in the Call Stack, these Web APIs work in the background -often on separate threads managed by the browser- to handle time-consuming tasks like network requests (`fetch`), timers (`setTimeout`), or DOM manipulation. Think of them as specialized "assistants" written in C++ that the browser lends to JavaScript to handle the heavy lifting without blocking the main thread.

--------------------

So, the browser is doing a massive amount of heavy lifting behind the scenes. It isn't just a window to view websites. It provides an **interface** (the Web APIs) that allows our JavaScript code to access these powerful, native features that don't exist inside the JavaScript engine itself. Let's use a Web API to observe what really happens.

```
navigator.geolocation.getCurrentPosition(
  (position) => console.log(position),
  (error) => console.error(error)
);
```

Take the **Geolocation API**, for instance. This is a classic Web API provided by the browser environment, not the JavaScript engine itself. It acts as a bridge, allowing your web application to request access to the user's real-world physical location. In the code above, notice that we pass two specific functions (callbacks) to the `getCurrentPosition` method:

1. **The Success Callback:** This function executes automatically only **after** the browser successfully triangulates the coordinates.

2. **The Error Callback:** This function triggers if something goes wrong during the process (for example, if the user denies permission or the GPS signal is weak).

--------------------

When this line of code executes, the `getCurrentPosition` function context is indeed pushed onto the Call Stack. However, it doesn't stay there to wait for the GPS data. Its primary role is simply to **register** your callback functions and **delegate** the heavy work to the Browser's Web API module. Once it successfully hands this work off (which takes milliseconds), it is immediately **popped** off the stack, long before the actual location data arrives. This mechanism ensures that the heavy lifting happens outside the main thread, so it never blocks your Call Stack. Let's visualize this process in Figure 2.1:

![](/images/book-how-javascript-works-behind-the-scenes/js1.png)
**Figure 2.1:** _Offloading the operation from the Call Stack to the Web APIs._

-------------------

In the background, the browser initiates a process and prompts the user for their location, as shown in Figure 2.2.

![](/images/book-how-javascript-works-behind-the-scenes/wantstoknowlocation.png)

**Figure 2.2:** _The browser asking the user for location access permission._

The truth is, we don't really know **when** the user will decide to click 'Allow'. But that is not a problem at all. Since the original function has already popped off the Call Stack, **the Main Thread is not blocked**; it is free to keep executing other code while the browser waits in the background. When the user finally grants permission, the Web API captures the location data and triggers the success callback to handle this result.

But, it can't just push that success function into the call stack. We don't know what's really happening in the call stack at this moment. It might interrupt some other process that are happening and it might cause some weird bugs. That's where other players come into play. Let's introduce **Task Queue**, also known as **Callback queue**. This queue holds Web API callbacks and event handlers to be able to get executed at some point in the future. You can see our progress in Figure 2.3.

-----------------

![](/images/book-how-javascript-works-behind-the-scenes/j2.png)

**Figure 2.3:** _The success callback waiting in the Task Queue._

But wait, when exactly is this "future"? How does the engine know that the Call Stack is available and that it is safe to push that code? This brings another player onto the scene: the **Event Loop**. Unlike the Stack, the Event Loop is not a piece of memory; it is a **constant monitoring process** running within the JavaScript Runtime Environment. Think of it as a heartbeat that infinitely runs a simple algorithm, as illustrated in **Figure 2.4**: it continuously checks whether the **Call Stack** is empty and if there is any pending work in the **Task Queue**.

-------------------

![](/images/book-how-javascript-works-behind-the-scenes/js3.png)
**Figure 2.4:** _The Event Loop monitoring the Call Stack and Task Queue._

If the Call Stack is completely empty, the Event Loop takes the first task from the **Task Queue** and pushes it onto the Stack.

-----------------

Now, let's walk through another example. This time, we will use `setTimeout()`, a very popular callback-based Web API that you are likely familiar with.

```js
setTimeout(() => {
  console.log("This will run after 1000 milliseconds");
}, 1000);
```

The syntax is straightforward. It accepts two main arguments:

1. A **Callback Function**: The code you want to execute later.

2. A **Delay**: How long the browser should wait (in milliseconds) before triggering that function.

Now, let's execute the code in **Listing 2.3**.

```js
setTimeout(() => {
  console.log("1000ms");
}, 1000);
setTimeout(() => {
  console.log("2000ms");
}, 2000);
console.log("JavaScript");
```

**Listing 2.3:** _A basic usage of the `setTimeout` Web API._

Just like with the Geolocation API, the first `setTimeout` is pushed onto the Call Stack. However, remember that it doesn't stay there to count down the time. Its sole responsibility is to **register** the callback and the delay with the Web API, after which it is immediately **popped** off the stack.

-----------------

The same process applies to the second `setTimeout`: it enters the stack, delegates the timer task to the browser environment, and returns immediately. So, what is the result? We now have two active timers running in parallel on the **Web APIs** side. Meanwhile, the Call Stack is empty and proceeds to execute the final synchronous instruction: `console.log("JavaScript")`. Since this is not asynchronous, it simply prints "JavaScript" to the console and is then popped off the stack. The resulting state is illustrated in **Figure 2.5**.

![](/images/book-how-javascript-works-behind-the-scenes/js10.png)
**Figure 2.5:** _Timers running in the Web APIs while the main thread completes its task._

-----------------

Once the 1000ms timer expires, the browser moves the corresponding callback into the **Task Queue**. Since the Call Stack is currently idle (empty), the Event Loop detects this pending work, retrieves the function, and pushes it onto the Call Stack for execution. The same process repeats for the second callback once the 2000ms mark is reached.

However, there is a crucial detail you must be aware of. The 1000ms delay we specified is actually the time it takes for the callback to move from the Web APIs to the **Task Queue**. It is **not** the guaranteed time for execution on the Call Stack! If the Call Stack happens to be busy, that function must wait its turn. **This means the actual execution could occur later than the specified 1000ms.**

Eventually, after approximately 2000ms, our final console output will look like this:

```js
JavaScript
1000ms
2000ms
```

These examples we've seen until now were Callback-based APIs. In this traditional approach, we explicitly pass a function (a callback) _into_ the API, asking it to "call us back" when it is done. While effective, this can lead to messy, nested code structures.

**There is also a modern approach called Promise-based APIs.** Instead of asking for a callback function upfront, a Promise-based API immediately returns a **Promise Object**. Think of this object as a temporary "placeholder" or a "guarantee" representing the future result of that asynchronous operation. Technically speaking, a Promise is just a JavaScript object with special internal slots. **Whether you manually initialize a `new Promise()` or invoke a Promise-based Web API (like `fetch`),** the engine allocates a specific object in memory that is governed by two hidden, system-level properties.

In modern JavaScript, Promises have become the standard. We use them to handle **complex asynchronous flows** efficiently, ensuring our code remains clean, readable, and easy to maintain compared to traditional callbacks. But what changes **behind the scenes** when we use Promise-based APIs instead of callback-based ones?

Whenever we work with Promises, we are interacting with the **Microtask Queue**. We have now added one more critical component to handle our async operations. The updated architecture is illustrated in **Figure 2.6**.

![](/images/book-how-javascript-works-behind-the-scenes/j11.png)

**Figure 2.6:** _The JavaScript Runtime Environment, now including the Microtask Queue._

---------------------

The **Microtask Queue** is a dedicated, high-priority queue designed specifically for **Promise-related operations**. Unlike the standard Task (Callback) Queue, this queue is exclusive. Only specific tasks get pushed here: primarily **Promise callbacks** (`.then`, `.catch`, `.finally`) and the resumption of **`async/await`** functions. (It also handles specialized APIs like `MutationObserver` and the direct `queueMicrotask` function).

There is a crucial concept you need to understand here: **The Event Loop prioritizes the Microtask Queue.** Whenever the Call Stack is available, the Event Loop first checks the Microtask Queue. If there are pending microtasks, it pushes them onto the Call Stack for execution. It will only proceed to the Task Queue once the Microtask Queue is completely empty.

Furthermore, the Event Loop revisits the Microtask Queue after executing _each_ event in the Task Queue. The cycle is specific: if the Microtask Queue is empty, the Event Loop executes one item from the Task Queue. Once that single task is complete, it immediately returns to the Microtask Queue to check for new work. **The Event Loop repeats this cycle until both the Task Queue and the Microtask Queue are empty.**

The most prominent example of a Promise-based Web API is undoubtedly **`fetch`**. As the modern standard for handling network requests, it has become an essential tool in every developer's toolkit. Since `fetch` relies entirely on Promises, it is the perfect candidate to demonstrate how these operations behave differently in the Event Loop compared to standard callbacks. Let's examine the real-world code example in Listing 2.4.

--------------------

```js
fetch("https://mybackendserver.com/api/users/...").then((res) =>
  console.log(res)
);

console.log("JavaScript");
```

**Listing 2.4:** _A code snippet illustrating a `fetch` request executing alongside a synchronous command._

First, the `fetch()` function is **pushed** onto the Call Stack. It immediately triggers the network request in the background (Web APIs) and creates the Promise Object. Once these tasks are initiated, `fetch` returns the promise object and is instantly **popped** off the stack.

Next, the `.then()` method is **pushed** onto the Stack. It grabs the Promise Object created in the previous step and **attaches** a new internal record -technically called a `PromiseReaction`- directly onto it. Think of it like sticking a post-it note on that specific Promise object saying: _'When you are done, execute this function.'_ Once this attachment is made, `.then()` is immediately **popped** off the stack.

Finally, the `console.log("JavaScript")` is **pushed** onto the Stack. It executes, prints the text, and is **popped** off.

When the network request completes successfully, the Browser (Web API) takes the data and goes back to that specific **Promise Object** in memory. **Under the hood, every Promise maintains internal properties to track its lifecycle and data**. For instance, `[[PromiseState]]` indicates the current status of the object, while `[[PromiseResult]]` acts as a placeholder for the eventual return value. The browser now performs a crucial update: It flips the **`[[PromiseState]]`** from `"pending"` to **`"fulfilled"`** and writes the response data directly into the **`[[PromiseResult]]`** slot.

**But what about our code?** Remember the "post-it note" (the callback) we attached earlier? It has been waiting patiently inside the **`[[PromiseFulfillReactions]]`** internal slot. The engine sees that the Promise is now fulfilled. However, it does **NOT** push that callback directly to the Call Stack (that would be dangerous, as we discussed). Instead, because this is a Promise, the engine pushes that callback function into the **Microtask Queue**.

The Event Loop steps in for the final act. It constantly monitors the Call Stack, and the moment it sees that the stack is completely **empty** (idle), it instantly looks at the Microtask Queue. It grabs our waiting callback, **pushes** it onto the Call Stack, and finally executes it to print the server response.

> **Note:** [If you want to learn about Promises and the internal Promise object in depth, click here to check out my 10-minute, fun-to-read blog post: How Promises Work in JavaScript](https://www.deepintodev.com/blog/how-promises-work-in-javascript)

We began this journey with a simple goal: to uncover the reality 
behind JavaScript. 

By now, you understand that your code is more than just text on a screen. You’ve seen how the engine parses your logic, transforming it from human-readable syntax into Abstract Syntax Trees and Bytecode, intelligently optimizing frequently executed paths intoMachine Code. You’ve also discovered how the Event Loop masterfully orchestrates execution, ensuring that asynchronous tasks never block theflow of your application. 

I hope this book has provided you with a solid foundation in how JavaScript works. 


