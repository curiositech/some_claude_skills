# A Philosophy of Software Design

by John Ousterhout

<!-- TOC -->

- [Preface](#preface)
- [Chapter 1: Introduction](#chapter-1-introduction)
- [Chapter 2: The Nature of Complexity](#chapter-2-the-nature-of-complexity)
  - [Symtoms of Complexity](#symtoms-of-complexity)
  - [Causes of Complexity](#causes-of-complexity)
  - [Complexity is Incremental](#complexity-is-incremental)
- [Chapter 3: Working Code Isn't Enough](#chapter-3-working-code-isnt-enough)
- [Chapter 4: Modules Should Be Deep](#chapter-4-modules-should-be-deep)
  - [Modular Design](#modular-design)
  - [Interface](#interface)
  - [Abstractions](#abstractions)
  - [Deep Modules](#deep-modules)
  - [Classitis](#classitis)
- [Chapter 5: Information Hiding (and Leakage)](#chapter-5-information-hiding-and-leakage)
  - [Information Hiding](#information-hiding)
  - [Information Leakage](#information-leakage)
  - [Temporal Decomposition](#temporal-decomposition)
  - [Other Topics](#other-topics)
- [Chapter 6: General-Purpose Modules are Deeper](#chapter-6-general-purpose-modules-are-deeper)
  - [Questions to Ask](#questions-to-ask)
- [Chapter 7: Different Layer, Different Abstraction](#chapter-7-different-layer-different-abstraction)
  - [Pass-through Methods](#pass-through-methods)
  - [When is interface duplication OK?](#when-is-interface-duplication-ok)
  - [Decorators](#decorators)
  - [Interface versus Implementation](#interface-versus-implementation)
  - [Pass-through Variables](#pass-through-variables)
- [Chapter 8: Pull Complexity Downwards](#chapter-8-pull-complexity-downwards)
  - [Configuration Parameters](#configuration-parameters)
  - [Rule of Thumb](#rule-of-thumb)
- [Chapter 9: Better Together Or Better Apart?](#chapter-9-better-together-or-better-apart)
  - [Bring Together: Simplify the Interface](#bring-together-simplify-the-interface)
  - [Bring Together: Eliminate Duplication](#bring-together-eliminate-duplication)
  - [Separate General-Purpose and Special-Purpose Code](#separate-general-purpose-and-special-purpose-code)
  - [Splitting and Joining Methods](#splitting-and-joining-methods)
- [Chapter 10: Define Errors Out of Existence](#chapter-10-define-errors-out-of-existence)
  - [Why exceptions add complexity](#why-exceptions-add-complexity)
  - [Too many exceptions](#too-many-exceptions)
  - [Define errors out of existence](#define-errors-out-of-existence)
  - [Mask Exceptions](#mask-exceptions)
  - [Exception aggregation](#exception-aggregation)
  - [Crash Application](#crash-application)
  - [Design special cases out of existence](#design-special-cases-out-of-existence)
  - [Taking it too far](#taking-it-too-far)
- [Chapter 11: Design it Twice](#chapter-11-design-it-twice)
  - [Ego](#ego)
- [Chapter 12: Why Write Comments? The Four Excuses](#chapter-12-why-write-comments-the-four-excuses)
  - [Good code is self-documenting](#good-code-is-self-documenting)
  - [I don't have time to write comments](#i-dont-have-time-to-write-comments)
  - [Comments get out of date and become misleading](#comments-get-out-of-date-and-become-misleading)
  - [Benefits of well-written comments](#benefits-of-well-written-comments)
- [Chapter 13: Comments Should Describe Things that Aren't Obvious from the Code](#chapter-13-comments-should-describe-things-that-arent-obvious-from-the-code)
  - [Pick conventions](#pick-conventions)
  - [Don't repeat the code](#dont-repeat-the-code)
  - [Lower-level comments add precision](#lower-level-comments-add-precision)
  - [Higher-evel comments enchance intuition](#higher-evel-comments-enchance-intuition)
  - [Interface documentation](#interface-documentation)
  - [Implementation comments: what and why, not how](#implementation-comments-what-and-why-not-how)
  - [Cross-module design decisions](#cross-module-design-decisions)
- [Chapter 14: Choosing Names](#chapter-14-choosing-names)
  - [Create an image](#create-an-image)
  - [Names should be precise](#names-should-be-precise)
  - [Use names consistently](#use-names-consistently)
  - [More Thoughts](#more-thoughts)
- [Chapter 15: Write The Comments First](#chapter-15-write-the-comments-first)
  - [Delayed comments are bad comments](#delayed-comments-are-bad-comments)
  - [Write the comments first](#write-the-comments-first)
- [Chapter 16: Modifying Existing Code](#chapter-16-modifying-existing-code)
  - [Stay Straetgic](#stay-straetgic)
  - [Maintaining comments: keep the comments near the code](#maintaining-comments-keep-the-comments-near-the-code)
  - [Comments belong in the code, not the commit log](#comments-belong-in-the-code-not-the-commit-log)
  - [Maintaining comments: avoid duplication](#maintaining-comments-avoid-duplication)
  - [Maintaining comments: check the diffs](#maintaining-comments-check-the-diffs)
  - [Higher-level comments are easier to maintain](#higher-level-comments-are-easier-to-maintain)
- [Chapter 17: Consistency](#chapter-17-consistency)
  - [Ensuring Consistency](#ensuring-consistency)
- [Chapter 18: Code Should be Obvious](#chapter-18-code-should-be-obvious)
  - [Things that make code more obvious](#things-that-make-code-more-obvious)
  - [Things that make code less obvious](#things-that-make-code-less-obvious)
- [Chapter 19: Software Trends](#chapter-19-software-trends)
  - [Object-oriented programming and inheritance](#object-oriented-programming-and-inheritance)
  - [Agile Development](#agile-development)
  - [Unit Tests](#unit-tests)
  - [Test-driven Development](#test-driven-development)
  - [Design Pattern](#design-pattern)
- [Chapter 20: Designing for Performance](#chapter-20-designing-for-performance)

<!-- /TOC -->

---
---

## Preface

- The most fundamental problem in computer science is problem decomposition: how to take a complex problem and divide it up into pieces that can be solved independently
- Overall goal is to reduce complexity; this is more important than any particular principle or idea you read here

---

## Chapter 1: Introduction

- Writing computer software is one of the purest creative activities in the history of the human race
- All programming requires is a creative mind and the ability to organize your thoughts. If you can visaulize a system, you can probably implement it in a computer program
- If we want to make it easier to write software, we msut find ways to make software simplier

Eliminating Complexity
1. Make code simpler and more obvious
2. Encapsulate complexity so that the programmer can work on a system without being exposed to all of its complexity at once (modular design)

- Software design is a continuous process that spans the entire lifecycle of a software system

- Waterfall model - divide project into discrete phases that need to be complete before starting the next phase
- Agile model - iterate your design so that each iteration exposes problems with the exiting design, which are fixed before the enxt set of features is designed

- Incremental development also means continuous redesign
  - Initial design is never the best one
  - Always look for opportunities to ipmrove the design of the system youa re working on

> Beautiful design reflects a balance between competing ideas and approaches

---

## Chapter 2: The Nature of Complexity

- The ability to reocgnize complexity is a crucial design skill. It allows you to identify problems before you invest a lot of effort in them, and it allows you to make good chocies among alternatives
- Complexity is anything related to the structure of a software system that makes it hard to understand and modify the system
- Complexity is more apparent to readers than writers
  - ask other people why they think your code is complex

> Your job as a developer is not just to create code that you can work with easily, but to create code that others can also work with easily

### Symtoms of Complexity

> One of the most important goals of good design is for a system to be obvious. In an obvious system, a developer can quickly understand how the existing code works and what is required to make a change

#### Change Amplification

- simple change requires code modifications in many different places

#### Cognitive Load

- how much a developer needs to know in order to complete a task

> Sometimes an approach that requires more lines of code is actually simpler because it reduces cognitive load

#### Unknown Unknowns

- it is not obvious which pieces of code must be modified to complete a task, or what information a developer must have to carry out the task successfully

> With unknown unknowns, it is unclear what to do or whether a proposed solution will will work

### Causes of Complexity

#### Dependencies

- exists when a given piece of code cannot be understood and modified in isolation
- fundamental part of software and cannot be completely eliminated; we purposely introduce dependencies as part of the software design process
- leads to change applification and high cognitive load

#### Obsecurity

- important information is not obvious
- creates unknown unknowns and contributes to high congnitive load

### Complexity is Incremental

- complexity isn't caused by a single catastrophic error, it accumulates in lots of small chunks
- incremental nature of complexity makes it hard to control

> It's easy to convince yourself that a little bit of complexity introcued by your current change is no big deal. However, if every developer takes this approach for every change, complexity accumulates rapidly

---

## Chapter 3: Working Code Isn't Enough

> Many organizations encourage a tactical mindset, focused on getting features working as quickly as possible. However if you want a good design, you must take a more strategic approach when you invest time to produce clean designs and fix problems

- tactical programming is short-sighted as you are rushing to get work done
- most import thing is the long-term structure of the system
- strategic programming requires an investment mindset
  - invest time to improve the design of the system
- it's worth taking a little extra time to find a simple design for each new class; rather than implementing the first idea that comes to mind, try a couple of alternative designs and pick the cleanest one
- make lots of small investments on a continual basis, adding up to about 10-20% of your total development time
- best way to lower development costs is to hire great engineers
  - they are much more productive than medicore engineers
- if your code base is a wreck, word will get out and this will make it harder to recruit
- it's a lot more fun to work in a company that cares about software design and has a clean code base

---

## Chapter 4: Modules Should Be Deep

> Design systems so that developers only need to face a small fraction of the overall compelxity at any given time

### Modular Design

- decomposing a software system into a collection of modules that are relatively independent
- modules must work together by calling each other's functions or methods, which results in modules having to know something about each other
- goal of modular design is to minimize the dependencies between modules
- module has two parts:
  1. **interface** consists of everything that a developer working in a different module must know in order to use the given module
  1. **implementation** consists of code that carries out the promises made by the interface
- best modules are those whose interfaces are much simplier than their implementation
  - simple interface minimizes complexity that a module imposes on the rest of the system
  - modifying a module without changing its interface means no other module is affected by the change

### Interface

- consists of two kinds of imformation: formal and informal
- formal parts of an interface are specified explicitly in the code
- informal parts are not specified in a way that can be understood or enforced by the programming language; these can only be described in the comments
- clearly specified interfaces indicate exactly what developers need to know in order to use the associated module

### Abstractions

- simplified view of an entity, which omits important details
- in modular programming, each module provides an abstraction in form of its interface
- can go wrong in two ways:
  - include details that are not really important, making the abstraction more complicated than necessary
  - omit important details which results in obscurity

### Deep Modules

> The best modules are deep: they have a lot of functionality behind a smiple interface

- think about depth as cost vs benefit; cost is interface, benefit is functionality

### Classitis

- conventional wisdom says that classes should be small, not deep
- results in classes that are individually simple, but produce tremendous complexity from the accumulated interfaces
- if an interface has many features, most developers will only be aware of a few of them

---

## Chapter 5: Information Hiding (and Leakage)

> Technique for achieving deep modules where the implementation is hidden and not exposed in the interface

### Information Hiding

- information hiding reduces complexity in two ways:
  1. Simplier interface to a module reduces cognitive load
  1. Easier to evolve system as design change related to information will only affect one module
- always think about the information hidden in a module
- `private` declarations are not hiding anything
- partial information hiding can also have value

### Information Leakage

> Same knowledge used in multiple places

- occurs when a design decision is reflected in multiple modules
- creates dependencies where changes require touching many different modules
- information can be leaked even if it's not in the interface
  - two functions expect the same file format
- if classes are small and closely tied to leak information, merge into single class
- pull shared information out of all affected classes and encapsulate in a new class

### Temporal Decomposition

- structure of system corresponds to the time order in which operations will occur
- when designing modules focus on the knowledge that's needed to perform each task, not the order in which tasks occur

### Other Topics

- interfaces should be designed to make the common case as simple as possible
  - best featuers are ones you get without even knowing they exist
- design private methods within a class so that each method encapsulates some information or capability and hides it from the rest of the class
- don't hiding information that is needed outside the module
  - goal is to minimize the amount of information that is needed outside of a module
  - recognize what is required and make sure it is exposed

---

## Chapter 6: General-Purpose Modules are Deeper

- generalize-purpose solution might include facilities that are never actually needed
- special-purpose approach is consistent with an incremental approach to software development
- general-purpose approach results in simpler and deeper interfaces than special-purpose approach
- general-purpose interfaces reduce cognitive load

### Questions to Ask

1. What is the simplierst interface that will cover all my current needs?
  - reducing number of methods in an API without reducing its overall capabilities makes it more general. Make sure you are not increasing number of method arguments
1. In how many situations will this method be used?
  - can you replace several special-purpose methods with a single general-purpose method
1. Is this API easy to use for my current needs?
  - if you have to write a lot of additional code to use a class for your current purpose, it probably doesn't have the right functionality

---

## Chapter 7: Different Layer, Different Abstraction

> Software systems are composed in layers, where higher layers use the facilities provided by lower layers. In a well-designed system, each layer provides a different abstraction from the layers above and below it. If adjacent layers have similar abstractions, we signals that we could have a problem with class decomposition

### Pass-through Methods

- method that does little except invoke another method, whose signature is similar or identical to that of the calling method
- make classes shallower: increase interface complexity, but do not increase total functionality
- create dependencies between classes
- indicate confusion over the division of responsiblities
- How to eliminate pass-thru methods:
  1. Expose lower level class directly to the callers of the higher level class
  1. Remove all responsibility for feature from higher level class
  1. Redistribute functionality between classes
  1. If classes can't be disentangled, merge them

### When is interface duplication OK?

- each new method should contribute significant functionality
- dispatcher method that uses arguments to figure out which method to invoke
- when several methods provide different implemtnations of the same interface, it reduces cognitive load

### Decorators

> take an existing object and extend its functionality by providing an API similar to the underlying object

- create a special-purpose extension of a class from a more generic core
- decorators classes tend to be shallow
- before creating a decorator, ask:
  - Can we add the new functionality directly to the underlying class?
  - If the new functionality is specialized, would it make sense to merge it with the use case?
  - Could the functionality be merged with an existing decorator?
  - Does new functionality need to wrap existing functionality?

### Interface versus Implementation

> The interface of a class should normally be different from its implementation: the representations used internally should be different from the abstractions that appear in the interface

### Pass-through Variables

- variable that is passed down thru a long chain of methods
- adds complexity because all intermediate methods must be aware of existence
- How to eliminate pass-through variables:
  1. Is there an object shared between the topmost and bottommost methods?
  1. Store information in a global variable, but has its own problems
  1. Context object that stores application's global state
    - allows multiple instances of the system to coexist in a single process, each with its own context
    - context will be needed many places so try to save it in system's major objects (include in constructors)
    - makes it easy to identify and manage global state of system
    - simplifies testing
    - make context variable immutable to make threadsafe

---

## Chapter 8: Pull Complexity Downwards

> More important for a module to have a simple interface than a simple implementation

- as a module developer, you should strive to make life as easy as possible for the users of your module, even that means extra work fo ryou
- if you solve the easy problems and punt the hard ones to somebody else, you amplify the complexity so that more people have to deal with the problem rather than just you

### Configuration Parameters

- rather than determining a particular behavior internally, a class can pull in a few parameters that control its behavior
- ask yourself if users are better able to find a value than what you can determine by yourself
  - if you still need a config value, try to infer sane a sane default

### Rule of Thumb

- Pull down complexity if it:
  1. is closely related to the class' existing functionality
  1. will result in many simplifications elsewhere in the applciation
  1. simplifies the class' interface

---

## Chapter 9: Better Together Or Better Apart?

> Given two pieces of functionality, should they be implemented together in the same place, or should their implemtnations be separated?

- the goal is to reduce complexity of the system as a whole and improve its modularity
- beware of dividing system into large number of smaller components
  - more interfaces and every new interface adds complexity
  - additional code to manage components
  - separation between components might make it hard to be aware of existence
  - code duplication
- it is beneficial to bring together pieces of code that are closely related
- indications that two pieces of code are closely related
  - share information
  - used together
  - overlap conceptually (share higher-level category)
  - hard to understand one piece of code without looking at other

### Bring Together: Simplify the Interface

- may be possible to define an interface for the new module that is simpler or easier to use than the origin interfaces.
- may be possible to perform functions automatically so that users are not aware of the difference

### Bring Together: Eliminate Duplication

- reorganize code to eliminate reptition
- this is effective if the repeated snippet is long and the replacement method has a simple signature
- another way to eliminate duplication is to refactor so the snippet is only excited in one place (goto aren't always harmful)

### Separate General-Purpose and Special-Purpose Code

- if a module contains a mechanism that can be used for several different purposes than it should provide one general-purpose method and allow other modules to contain special-purpose code, as required
- in general, lower layers of system tend to be more general-purpose and upper layers more special-purpose
- separate by pulling special-purpose code upwards into higher layers, leaving the lower layers general-purpose

### Splitting and Joining Methods

> When designing methods, the most important goal is to provide clean and simple abstractions

- length by itself is rarely a good reason for splitting up a method as we now have additional interfaces, which add complexity
- shouldn't break up a method unless it makes the overall system simplier
- if method had complex interactions within its blocks, it's even more important to keep them together
- method should be deep with a clean and simple abstraction
- Split a method if it results in a cleaner abstraction:
  - factor out a subtask into a separate method which is invoked by the parent method. Revert if you are jumping back and forth a lot
  - split method into two separate methods with interfaces that are simplier than the interface of the original method

---

## Chapter 10: Define Errors Out of Existence

> Exception handling is one of the worst sources of complexity in software systems

- **exception** - any uncommon condition that alters the normal flow of control in a program

### Why exceptions add complexity

- Ways exceptions can add complexity:
  - caller may provide bad arguemnts or configuration information
  - invoked method may not be able to complete a requested operation
  - in distributed systems, network packets may be lost or delayed, servers may not respond in a teimely fashion, or peers may communicate in unexpected ways
  - code may detect bugs, internal inconsistencies, or situations it is not prepared to handle
- exception handling can account for a significant fraction of all the code in a system
- exception handling code is inherently more difficult to write than normal-case code
- when an exception occurs, programmer can deal with two ways:
  1. move forward and complete the work in progress in spite of the exception
  1. abort the operation in progress and report the exception upwards
    - aborting can result in an inconsistent system state so the exception handling code must restore consistency
- handling exceptions can result in more exceptions
  - secondary exceptions occuring during recovery are often more subtle and complex than the primary exceptions
  - find a way to handle exceptions without introducing more exceptions
- exceptions don't occur very often in running systems, so exception handling code is rarely executed
  - write tests to make sure the code functions the way you think it should

### Too many exceptions

- problems are exacerbated when too many unnecessary exceptions are defined. This results in an over-defensive coding style
- exceptions are a way to punt the problem to the caller
- exceptions are part of your interface, keep them simple
- exceptions also affect multiple layers as they can propogate through several stacks before being caught
- best way to reduce complexity is to reduce the number of places exceptions have to be handled

### Define errors out of existence

- define APIs so there are no exceptions to handle and reduce the amount of code that needs to be written to handle errors

### Mask Exceptions

- when an exceptional condition is detected and handled at a low level in the system so that higher levels of software do not need to be aware of the condition
- doesn't work in all situations, but the reduced interface allows classes to be deeper
- example of pulling complexity downward

### Exception aggregation

- handle many exceptions with a single piece of code, rather than writing distinct handlers for many individual exceptions
- exception handling design pattern
  - if system processes a series of requests, it's useful to define an exception that aborts the current request, cleans up the system's state, and contnues with the next request
  - the exception is caught in a single place near the top of the system's request-handling loop
  - exception can be thrown at any point in the processing of a request to abort the request
  - different subclasses of the exception can be defined for different conditions
- aggregation works best if an exception propagates several levels up the stack before it is handled; results in more exceptions from more methods to be handled in the same place
- form of general-purpose mechanism over special-purpose

### Crash Application

- certain errors are not worth tryign to handle
- print diagnostic information and abort application
- `ckalloc` vs `malloc`

### Design special cases out of existence

- special cases can result in code with lots of if statements which make it hard to understand
- design normal case in a way that automatically handles special case without extra code

### Taking it too far

- defining away exceptions or masking them makes sense if the exception information isn't needed outside the moduel
- with exceptions, we must determine what is important and what is not important. Things that are not important should be hidden, and the more of them the better. If something is important, it must be exposed

---

## Chapter 11: Design it Twice

> designing software is hard, so it's unlikely that your first thought about how to structre a module or system will produce the best design

- you will end up with a much better result if you consider multiple options for each major decison decision
- don't need to pin down every detail, high-level sketch of the important methods is more than enough
- try to pick radically different approaches
- even if there is only one obvious approach, try another one
- after you have sketched out all the alternatives, make a list of pros and cons for each one
- consider
  - which version has the simpler interface?
  - is one interface more general-purpose than another?
  - does one interface enable a more efficient implementation?
- once you have compared the designs, you can make an informed decision
- can apply this principle to many levels of a system
  - goals are different for the interface and implementation so consider the best approach
- this should not take a lot of extra time and it will pay off in the long run as you will not to deal with the extra complexity and cognitive load that poor design brings

### Ego

- smart people feel pressure to get things right the firs ttime
- solving hard problems requires complex solutions where the first design is rarely the best one

---

## Chapter 12: Why Write Comments? The Four Excuses

- comments are essential to help developers under a system and work efficiently
- documentation plays an important role in abstraction; without comments, you can't hdie complexity
- process of writing comments will improve a system's design
- good software design loses value if its poorly documented

### Good code is self-documenting

> If users must read the code of a method in orer to use it, then there is no abstraction

- there are things you can do when writing code to reduce the need of comments, but there is a significant amount of design information that can't be represented in comments
- it's not practical for users to read the code for large projects
- important that comments are written in a human language, which makes them less precise but provides more expressive power

### I don't have time to write comments

- if you want a clean software structure, which will allow you to work efficiently over the long-term, then you must take some time to create that structure
- writing good comments won't take more than 10% of your development time
- benefits of good documentation will quickly offset this cost

### Comments get out of date and become misleading

- keeping documenting up-to-date does not require an enormous effort
- code reviews provide a great mechanicsm for detecting and fixing stale comments

### Benefits of well-written comments

> Comments capture information that was in the midn of the designer but couldn't be represented in the code

- comments are valuable even on single-person projects as many of the details of the original design will have been forgotten
- documentation reduces cognitive load by providing developers with the ifnormation they need to make changes and by making it easy for developers to ignore information that is irrelevant
- docuemtnation can also reduce unknown unknowns by clarifying the structure of the system so that it is clear what is information and code is relevant for any given change

---

## Chapter 13: Comments Should Describe Things that Aren't Obvious from the Code

- comments can make it explicit and clear why code is needed or implemented in a particular way
- developers should be able to understand the abstraction provided by a module without reading any code other than its externally visible declaration

### Pick conventions

- conventions ensure consistency and force you to write comments
- types of comments:
  - **interface** comment block that precedes the declaration of a module
  - **data structure member** next to the declaration of a field in a data structure
  - **implementation** comment inside the code of a method or a function that describes how it works internally
  - **cross-module** describing dependencies that cross module boundaries

### Don't repeat the code

> Could someone who has never seen the code write the comments just by looking at the code next to the comment?

- use different words in the comment from those in the name of the entity being described

### Lower-level comments add precision

> Lower-level comments offer precision by clarifying exact meaning

- comments augment the code by providing information at a different level of detail
- think about units, boundary conditions, null values, side effects, etc
- when documenting a variable, think nouns not verbs

### Higher-evel comments enchance intuition

> High-level comments offer intuition by describing reasoning behind the code

- think about
  - what is the code trying to do
  - what is the simplest thing you can say that explans everything in the code
  - what is the most important thing about this code
- need to ignore low-level details and think about system only in terms of most fundamental characteristics
- comments describing "how we get here" are useful

### Interface documentation

> Provide information that someone needs to know in order to use a clas or method

- code isn't suitable for defining abstractions
- if you want code that presents good abstractions, you must document those abstractions with comments
- separate interface comments from implementation comments

### Implementation comments: what and why, not how

> Help readers understand what code is doing and why it was done that way

- add comment before major blocks to provide high-level description of what that block does
- have comment before loop that describes what happens in each iteration
- loop comments are only needed longer or more complex loops, where it may not be obvious what the loop is doing
- if you are fixing a bug, add a comment to the issue in the bug tracking database

### Cross-module design decisions

- challenge is to finding a place to put it where it can be found
- design_notes central file with references in modules, as required

---

## Chapter 14: Choosing Names

> Selecting names for variables, methods, and other entities is one of the most underrated aspects of software design. Good names are a form of documentation: they make code easier to understand. They reduce the need for other documentation and make it easier to detect errors. Conversely, poor name choices increase the complexity of code and create ambiguities and misunderstandings that can result in bugs. Name chocie is an example of the principle that complexity is incremental. Choosing a mediocre name for particular variable, as opposed to the best possible name, probably won't have much impact on the overall complexity of a system. However, software systems have thousands of variables; choosing good names for all of these will have a significant impact on complexity and manageability.

- most develoeprs don't spend much time thinking about names; they tend to use the first name that comes to mind as long as it is reasonably close to matching the thing it names
- good names have 2 properties: precision and consistency

### Create an image

- goal is to create an image in the mind of the reader about the nature of the thing being named
- good name describes what the underlying entity is and what it is not
- names become unwieldy if they contain more than two or three words
- names are a form of abstraction: they provide a simplified way of thinking about a more complex underlying entity

### Names should be precise

- most common problem is that names are too generic or vague
- if you find it difficult to come up with a name for a particular variable that is precise, intuitive, and not too long, this is red flag
  - variable may not have a clear definition or purpose
- process of choosing a good name can improve your design by identifying weaknesses

### Use names consistently

- consistency reduces cognitive load: reader has seen the name in one context, they can reuse their knowledge and make assumptions when they see the name in a different context
- three requirements:
  1. always use the common name for a given purpose
  1. never use the common name for anythign other than the given purpose
  1. make sure the purpose is narrow enough that all variables with the name have the same behavior

### More Thoughts

- readability must be determined by the readers, not the writers
- developing a skill for naming things is an investment: it's hard at first, but becomes easier the more you do it

---

## Chapter 15: Write The Comments First

> Use comments as part of the design process

- best time to write comments is at the beginning of the process
- three benefits:
  1. produces better comments as key design issues are fresh in your mind
  1. comments are an abstraction and can help indicate complexity before you write code
  1. it makes things more fun (calm down, John Ousterhout)

### Delayed comments are bad comments

- delaying documentation often means it does not get written
- even if you go back, you forgot what was in your head during the design process
- most important ocmments will be missing important facts

### Write the comments first

- write by writing the class interface comment
- write interface comments and signatures for the most important public methods, but leave method bodies empty
- iterate a bit over comment until basic structure feels right
- write declarations and commnets for the most important class instance variables
- fill in bodies of methods, adding implementation comments as needed
- will find flaws in your decision

---

## Chapter 16: Modifying Existing Code

- it's not possible to conceive the right design for a system at the outset; the design of a mature system is determined more by changes made during the system's evolution than by any initial conception

### Stay Straetgic

- when developers go into existing code to make changes such as bug fixes or new features, they don't usually think strategically
  - usually think what is the smallest possible change I can make that does what I need?
- if you invest a little extra time to refactor and improve the system design, you'll end up with a cleaner system
- whenever you modify any code, try to find a way to improve the system design at least a little bit in the process
- every development organization should plan to spend a small fraction of its total effort on cleanup and refactoring; this work will pay for itself over the long run

### Maintaining comments: keep the comments near the code

- best way to ensure that comments get updated is to postiion them close to the close they describe, so develoeprs will see them when they change the code
- if a method has three major phases, don't write one comment at the top of the method that describes all of the phases in detail, write a separate comment for each phase

### Comments belong in the code, not the commit log

- place things where develoeprs are likely to see it

### Maintaining comments: avoid duplication

- if information is already documented someplace outside of your projet, don't repeat the documentation; just reference the external source

### Maintaining comments: check the diffs

- always make sure the change you made is also reflected in the comments; do this during the PR process

### Higher-level comments are easier to maintain

- do not reflect details of the code so they will not be affected by minor code changes; only changes in overall behavior will affect these comments

---

## Chapter 17: Consistency

- consistency is a powerful tool for reducing the complexity of a system and making its behavior more obvious
- consistency means that similar things are done in similar ways and dissimilar things are done in different ways
- once you have learned how somethign is done in one place, you can use that knowledge to understand other places that use the same approach

### Ensuring Consistency

- consistence is hard to maintain, especially when manny people work on a project over a long time
- create a document that lists the most important overall conventions such as coding style guidelines
- best way to enforce conventions is to write a tool that checks for violations, and make sure that code cannot be committed to the repository unless it passes the checker
- code reviews provide an opportunity for education
- do not change existing conventions; a better idea is not a sufficient excuse to introduce inconsistencies
  - reconsidering established conventions is rarely a good use of developer time

---

## Chapter 18: Code Should be Obvious

> Software should be designed for ease of reading, not ease of writing

- obvious code can be read quickly, without much thought
- unobvious code must expend a lot of time and energy to understand it; reduces efficiency and increases likelihood of misunderstanding and bugs
- it's easier to notice thatsomeone else's code is nonobvious than to see problems with your own code
- code review plays a big part in finding obviousness of code

### Things that make code more obvious

- use design techniques such as abstractions
- ensure readers always have information they need to understand code
- good names
- consistency
- white space
- comments help us understand code that can't be made more obvoius

### Things that make code less obvious

- event driven programming where application responds to external occurences; hard to follow flow of control
- generic containers with grouped elements; use `collections.namedtuples` instead
- code that violates reader's expectations

---

## Chapter 19: Software Trends

### Object-oriented programming and inheritance

- private methods and variables can be used to ensure information hiding
- forms of inheritance:
  1. Interface Inheritance
    - parent class defines the signature for one or more methods, but does not implement the methods
    - provides leverage against complexity by reusing the same interface for multiple purposes
    - many different implementations of interface means it is deep
  2. Implementation Inheritance
    - parent class defines not only signatures, but also default implemtnations
    - reduces the amount of code that needs to be modified, but creates dependencies between parent and subclasses
    - look into composition before using implementation inheritance
- mechanisms of OOP can assist in implementing clean designs, they do not guarantee good designs

### Agile Development

- mostly about process of software development (organizing teams, managing schedules, the role of unit testing, interacting with customers, etc) as opposed to software design
- development should be incremental and iterative; each increment adds a few new abstractions and refactors existing abstractions based on experience
- Agile tends to focus developers on features, not abstractions and it encourages developers to put off design decisions in order to produce working software

### Unit Tests

- tests facilitate refactoring
- without a test suite, it's dangerous to make major structural changes to a system

### Test-driven Development

- TDD focuses attention on getting specific features working rather than finding the best design
- it makes sense to write tests first when fixing bugs; replicate issue and fix

### Design Pattern

- not every problem can be solved cleanly with an existing design pattern

---

## Chapter 20: Designing for Performance

> Clean design and high performance are compatible

- simpler code runs faster than complex code
- deep classes are more efficient than shallow classes as they get more work done for each function call
- before making any changes, measure the system's existing behavior
  - find where we can make the biggest impact
  - provides a baseline to see how much we improved performance
- remove special cases from critical path. when redesigning for performance, try to minimize the number of special cases you must check
