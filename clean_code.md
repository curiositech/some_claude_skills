# Clean Code
A Handbook of Agile Software Craftsmanship

By Robert C. Martin (aka "Uncle Bob")

<!-- TOC -->

- [Chapter 1: Clean Code](#chapter-1-clean-code)
  - [Boy Scout Rule](#boy-scout-rule)
- [Chapter 2: Meaningful Names](#chapter-2-meaningful-names)
- [Chapter 3: Functions](#chapter-3-functions)
  - [Function Goals](#function-goals)
- [Chapter 4: Comments](#chapter-4-comments)
  - [Good Comments](#good-comments)
- [Chapter 5: Formatting](#chapter-5-formatting)
  - [The Newspaper Metaphor](#the-newspaper-metaphor)
- [Chapter 6: Objects and Data Structures](#chapter-6-objects-and-data-structures)
  - [Conclusion](#conclusion)
- [Chapter 7: Error Handling](#chapter-7-error-handling)
  - [Conclusion](#conclusion-1)
- [Chapter 8: Boundaries](#chapter-8-boundaries)
  - [Conclusion](#conclusion-2)
- [Chapter 9: Unit Tests](#chapter-9-unit-tests)
  - [Rules for Clean Test](#rules-for-clean-test)
  - [Three Laws of TDD](#three-laws-of-tdd)
- [Chapter 10: Classes](#chapter-10-classes)
  - [Single Responsibility Principle](#single-responsibility-principle)
  - [Open-Close Principle](#open-close-principle)
- [Chapter 11: Systems](#chapter-11-systems)
  - [Conclusion](#conclusion-3)
- [Chapter 12: Emergence](#chapter-12-emergence)
  - [Rules for Simple Design](#rules-for-simple-design)
- [Chapter 13: Concurrency](#chapter-13-concurrency)
  - [Concurrency Myths and Misconceptions](#concurrency-myths-and-misconceptions)
  - [Concurrency Defense Principles](#concurrency-defense-principles)
  - [Conclusion](#conclusion-4)
- [Chapter 14: Successive Refinement](#chapter-14-successive-refinement)
  - [Conclusion](#conclusion-5)
- [Chapter 15: JUnit Internals](#chapter-15-junit-internals)
- [Chapter 16: Refactoring `SerialDate`](#chapter-16-refactoring-serialdate)
- [Chapter 17: Smells and Heuristics](#chapter-17-smells-and-heuristics)
  - [Comments](#comments)
  - [Environment](#environment)
  - [Functions](#functions)
  - [General](#general)
  - [Names](#names)
  - [Tests](#tests)
  - [Conclusion](#conclusion-6)
- [Appendix A: Concurrency II](#appendix-a-concurrency-ii)
  - [Client-Server Example](#client-server-example)
  - [Single Responsibility Principle](#single-responsibility-principle-1)
  - [Knowing Your Library](#knowing-your-library)
  - [Server-based locking](#server-based-locking)
  - [Deadlocks](#deadlocks)
  - [Testing Multi-threaded Code](#testing-multi-threaded-code)

<!-- /TOC -->

---
---

## Chapter 1: Clean Code

> You cannot write code if you cannot read the surrounding code. The code you are trying to write today will be hard or easy to write depending on how hard or eqasy the surrounding code is to read. So if you want to go fast, if you want to get done quickly, if you want your code to be easy to write, make it easy to read.

### Boy Scout Rule

Leave the campground cleaner than you found it

> If we all checked-in our code a little cleaner than when we checked it out, the code simply could not rot. The cleanup doesn't have to be something big. Change one variable name for the better, break up one function that's a little too large, eliminate one small bit of duplication, clean up one composite `if` statement

## Chapter 2: Meaningful Names

> Hardest thing about choosing good names is that it requires good descriptive skills and a shared cultural background

- Use intention revealing names
    - choosing good names takes time but saves more than it takes
- Avoid disinformation
    - avoid leaving false clues that obscure meaning of code
    - avoid words whose entrenched meanings vary from our intended meaning
    - spelling similar concepts similarly is *information*
- Make meaningful distinctions
    - if names must be different, then they should also mean something different
    - noise words are redundant (adding `variable`, `df` to name)
    - distinguish names in such a way that the reader knows what the differences offer
- Use pronounceable names
- Use searchable names
    - the length of a name should correspond to the size of its scope
    - if a variable or constant might be seen or used in multiple palces in code, it's imperative to give it a search-friendly name
- Avoid encodings
    - type prefixes
- Avoid mental mapping
    - readers shouldn't have to mentally translate your names into other names they already know
- Don't be cute
    - no inside jokes
    - say what you mean, mean what you say
- Pick one word per concept
- Don't pun
- Use solution domain names
    - use computer science terminology in names
- Use problem domain names
    - code that has more to do with problem domain concepts should have names drawn from the problem domain
- Add meaningful context
    - place names in context for your reader by enclosing them in well-named classes, functions, or namespaces
- Don't add gratuitous context
- Class names
    - classes and objects should have noun or noun phrase names like `Customer`, `WikiPage`, `Account`, and `AddressParser`
    - avoid words like `Manager`, `Processor`, `Data`, or `Info` in the name of a class
    - class names should never be verbs
- Method names
    - method should have verb or verb phrase names like `postPayment`, `deletePage`, or `save`

## Chapter 3: Functions

> Functions are the first line of organization in any program

> - Functions should do one thing. They should do it well. They should do it only.

### Function Goals

- small
- should not be large enough to hold nested structures
- Statements within our function should be at same level of abstraction
- want code to have a top down narrative
- avoid switch statements
    - if you have to use switch, do it somewhere and abstract it away with polymorphic classes
- use descriptive names, be consistent
- don't use too many function arguments
- flag arguments are ugly (eh, debatable. I like sane defaults)
- good names can go a long way towards explaining the intent of a function and order and intent of arguments
- have no side effects
- avoid temporal coupling
- if your functions must change the state of something, have it change the state of its owning object
- should either do something or answer something, but not both
- prefer exceptions to returning error codes
    - new exceptions are derivatives of the exception class
- extract try/catch blocks into functions of their own
- duplication is the root of all evil
- write your code, write tests, clean your code with tests in place

## Chapter 4: Comments

> The proper use of comments is to compensate for our failure to express ourself in code

- truth can only be found in one place: the code
- clear and expressive code with few comments is far superior to cluttered and complex code with lots of comments
- it only takes a few seconds of thought to explain most of your intent in code: in most cases, create a function that says the same thing as the comment you want to write

### Good Comments

- legal comments
- informative comments
- explanation of intent
- clarification
- warning of consequence
- `TODO` comments
- amplification
- documenting public api using Javdocs or Sphinx

## Chapter 5: Formatting

> The coding style and readability set precedents that continue to affect maintainability and extensibility long after the original code has been changed beyond recognition. Your style and discipline survives, even though your code does not.

- smaller files are usually easier to understand than larger files
- think of reading code like reading a newspaper (headline with details as you go further)
- groups of lines represent a complete thought, and these should be separated from other blocks with blank lines
- lines of code that are tightly related should appear vertically dense
- concepts thare are closely related should be kept vertically close to each other
- variables should be declared as close to their usage as possible
  - instance variable should be declared at the top of a class
- if one function calls another, they should be vertically close and the caller should be above the callee (gives the program a natural flow)
- certain bits of code want to be near other bits so we should keep them together vertically
- try to keep line lengths short, 80-100-120
- use horizontal whitespace to associate things that are strongly related and disassociate things that are more weakly related
- source code is a hierarchy rather than an outline
  - to make the hierarchy of scopes visible, we indent the lines of source code in proportion to their position in the hiearchy
- team should agree on a consistent style that will be used for formatting

### The Newspaper Metaphor

> Think of a well-written newspaper article. You read it vertically. At the top you expect a headline that will tell you what the story is abvout and allows you to decide whether it is something you want to read. The first paragraph gives you a synopsis of the whole story, hiding all the details while giving you the broad-brush concepts. As you continue downward, the details increase until you have all the dates, names, quotes, claims, and other minutia.
>
> We would like a source file to be like a newspaper article. The name should be simple, but explanatory. The name, by itself, should be sufficient to tell us whether we are in the right module or not. The topmost parts of the source file should provide the high-level concepts and algorithms. Details should increase as we move downward, until the end we find the lowest level functions and details in the source file.
>
> A newspaper is composed of many articles; most are very small. Some are a bit larger. Very few contain as much text as a page can hold. This makes the newspaper *useable*. If the newspaper were just one long story containing a disorganized agglomeration of facts, dates, and names, then we simply would not read it.

## Chapter 6: Objects and Data Structures

> Hiding implementations is not just a matter of putting a layer of functions between the variables. Hiding implementations is about abstractions! A class does not simply push its variables out thru getters and setters. Rather it exposes abstract interfaces that allow its users to manipulate the *essence- of the data, without having to know its implementations.
>
> We do not want to expose the details of our data. Rather we want to express our data in abstract terms. This is not merely accomplished by using interfaces and/or getters and setters. Serious thought needs to be put into the best way to represent the data that an object contains. The worst option is to blithely add getters and setters.

- Objects hide their data behind abstractions and expose functions that operate on that data
  - OO code, on the other hand, makes it easy to add new classes without changing existing functions
  - OO code makes it hard to add new functions because all the classes must change
- Data structures expose their data and have no meaningful functions
  - procedural code (code using data structures) makes it easy to add new functions without changing existing data structures
  - procedural code makes it hard to add new data structures because all the functions must change
- **Law of Demeter*- - a module should not know about the innards of the objects it manipulates
- **Data Transfer Objects*- (DTOs) refer to data structures that are classes with public variables and no functions
  - [`collections.namedtuple`](https://docs.python.org/3/library/collections.html#collections.namedtuple) in Python
  - DTOs are first in a series of translation stages that convert raw data in a database into objects in the application code

### Conclusion

> Objects expose behavior and hide data. This makes it easy to add new kinds of objects without changing existing behaviors. It also makes it hard to add new behaviors to existing objects. Data structures expose data and have no significant behavior. This makes it easy to add new behaviors to existing data structures but makes it hard to add new data structures to existing functions.
>
> In any given system, we will sometimes want the flexibility to add new data types, and so we prefer objects for that part of the system. Other times we will want the flexibility to add new behaviors, and so in that part of the system we prefer data types and procedures. Good software developers understand these issues without prejudice and choose the approach that is best for the job at hand.

## Chapter 7: Error Handling

> Error handling is important, but if it obscures logic, it's wrong

- try to write tests that force exceptions and then add behavior to your handler to satisfy tests
  - this will cause you to build the transaction scope of the `try` block first and will help maintain the transaction nature of that scope
- each exception that you throw should provide enough context to determine the source and location of an error
- create informative error messages and pass them along with your exceptions. Mention the operation that failed and the type of failure. If you are logging in your application, pass along enough information to be able to log the error in your `catch`
- if we are doing the same work in many different `except` blocks, we can simplify our code by wrapping the API we are calling and making sure that it returns a common exception type
  - benefits of wrapping API:
    - minimize dependency upon it
    - move to a different library in the future without much penalty
    - easier to mock when you are testing
    - you can define an API that you feel comfortable with vs having to use the vendor's API
- often a single exception is fine for a particular area of code
  - information sent with exception can distinguish the errors
  - use different classes only if there are types when you want to catch one exception and allow another one to pass thru
- create a class or configure an object so that it handles a special case for you (Fowler -- Special Case Pattern)
  - client code does not have to deal with exceptional behavior, it's encapsulated inside of the special case object
- don't return `null`, return an empty container
  - this isn't the best advice for Python
- do not pass `null` into methods

### Conclusion

> Clean code is readable, but it must also be robust. These are not conflicting goals. We can write robust clean code if we see error handling as a separate concern, something that is viewable independently of our main logic. To the degree that we are able to do that, we can reason about it independently, and we can make great strides in the maintainability of our code.

## Chapter 8: Boundaries

> There is a natural tension between the provider of an interface and the user of an interface. Providers of third-party packages and frameworks strive for broad applicability so tey can work in many environments and appeal to a wide audience. Users, on the other hand, want an interface that is focused on their particular needs. This tension can cause problems at the boundaries of the system.

- if you want to use a boundary interface like `Map`, keep it inside the class, or close family of classes, where it is used. Avoid returning it from, or accepting it as an argument to, public APIs.
- it is pragmatic to write tests for third-party code
  - learning a new codebase is hard, try to write tests to explore our understanding of the library
  - tests focus on what we want out of the API
  - our tests can be used to check if new versions of the third-party library works the way we expect it to work
- define your own interface if the code you want to integrate with has not been written, do it even if it has been written
  - the Adapter Pattern encapsulates the interaction with the API and provides a single place to change when the API evolves

### Conclusion

> Interesting things happen at boundaries. Change is one of those things. Good software designs accommodate change without huge investments and rework. When we use code that is out of our control, special care must be taken to protect our investment and make sure future change is not too costly
>
> Code at the boundaries needs clear separation and tests that define expectations. We should avoid letting too much of our code know about the third-party particulars. It's better to depend on something you control than on something you don't control, lest it end up controlling you.
>
> We manage third-party boundaries by having very few places in the code that refer to them

## Chapter 9: Unit Tests

> Test code is just as important as production code. It is not a second-class citizen. It requires thought, design, and care. It must be kept as clean as production code.

- in the past we would write ad-hoc code to test our classes and methods and run it via a simple driver that we interacted with
- now we have test runners that standardize how we structure and store our tests so they can be used by anybody
- sheer bulk of tests can rival size of production code so it needs to be clean
  - dirty tests make things hard to change
  - the more tangled the test code, the more likely it is that you will spend more time cramming new tests into the suite than it takes to write the new production code
- the higher the test coverage, the less you fear
- tests allow you to change your code with near impunity
  - improve architecture and design without feature
- clean tests are **readable**
- invent domain-specific testing language that is made up of functions and utilities that make tests more convenient to write and easier to read
  - not developed up front, rather it evolves from the continued refactoring of test code that has gotten too tainted by obfuscating detail
  - pytest fixtures that return errors
- test code does not need to be as efficient as production code
- have a `getState()` method in your class that generates the current state which you can compare to expected state
- each test should encapsulate a single concept

### Rules for Clean Test

- **F**ast. Tests should be fast
- **I**ndependent. Tests should not depend on each other.
- **R**epeatable. Tests should be repeatable in any environment
- **S**elf-validating. Tests should have boolean output, either pass or fail
- **T**imely. Tests need to be written in a timely fashion

### Three Laws of TDD

1. You may not write production code until you have written a failing unit test.
1. You may not write more of a unit test than is sufficient to fail, and not compiling is failing.
1. You may not write more production code than is sufficient to pass the currently failing test.

## Chapter 10: Classes

- class should begin with a list of variables, public functions, and then private functions are called by public funtions
- classes should be small in terms of number of responsibilities
- name of class should describe what responsibilities it fulfills
  - ambiguous class names likely have too many responsibilities
  - trying to identify responsibilities helps us recognize and create better abstractions
- classes should have a small number of instance variables
  - the more variables a method manipulates, the more cohesive that method is to its class
  - classes should have relatively high cohesion
- when classes lose cohesion, split them
  - breaking a large function into many smaller functions often gives us the opportunity to split several smaller classes out as well
- tests allow us to refactor without fear
- organize our classes so to reduce the risk of change
- dependencies upon concrete details create challenges for testing our system
  - dependency injection allows us to decouple systems to become more testable

### Single Responsibility Principle

> A class or module should have one, and only one, reason to change

- getting software to work and making software clean are two very different activities
- problem is that too many people think we are done once the program works, they fail to switch to the other concern of organization and cleanliness
  - we move to the next problem rather than going back and breaking up our classes into decoupled units with single responsibilities
- every sizeable system will contain a large amount of logic and complexity
  - we should organize code so we know where to find it

### Open-Close Principle

> Classes should be open for extension but closed for modification

- structure systems so that we muck with as little as possible when we update them with new or changed features

## Chapter 11: Systems

> Software systems are unique compared to physical systems. Their architectures can grow incrementally, if we maintain the proper separation of concerns

- it is a myth that we can get systems "right the first time." Instead, we should implement only today's stories, then refactor and expand the system to implement new stories tomorrow. THi sis the essence of iterative and incremental agility. Test-driven development, refactoring, and the clean code they produce make this work at the code level.
- best to postpone decisions until the last possible moment
- standards make it easier to reuse ideas and components, but creating standards takes too long and lose touch with the real needs of the adopters they are intending to serve
- Domain Specific Languages (DSLs) raise the abstraction level above code idioms and design patterns
  - allow developer to reveal the intent of the code at the appropriate level of abstraction

### Conclusion

> Systems must be clean too. An invasive architecture overwhelms the domain logic and impacts agility. When the domain logic is obscured, quality suffers because bugs find it easier to hide and stories become harder to implement. If agility is compromised, productivity suffers and the benefits of TDD are lost
>
> At all levels of abstraction, the intent should be clear. This will only happen if you write plain old objects and use aspect like mechanisms to incorporate other implementation concerns noninvasively.
>
> Whether you are designing systems or individual modules, never forget to use the simples thing that can possibly work.

## Chapter 12: Emergence

> It's easy to write code that we understand, because at the time we write it we're deep in an understanding of the problem we're trying to solve. Other maintainers of the code aren't going to have so deep an understanding

- design must produce a system that acts as intended
- tests help us ensure the program work as intended
- writing tests leads to better designs
- tests enable refactoring and empower us to keep our code clean
- duplication is the primary enemy of a well-designed system, it represents additional work, additional risk, and additional unnecessary complexity
- express yourself by choosing good names and by keeping your functions and classes small
- often we get our working working and move onto the next program without giving sufficient thought to making that code easy for the next person to read

### Rules for Simple Design

1. Runs all the tests
1. Contains no duplication
1. Expresses the intent of the programmer
1. Minimizes the number of classes and methods

## Chapter 13: Concurrency

> Objects are abstractions of processing. Threads are abstractions of schedule.

- concurrency is a decoupling strategy: it helps us decouple what gets done from when it gets done improving both the throughput and structure of an application
- concurrent applications look like many collaborating computers rather than one big main loop
  - can make the system easier to understand and offers some powerful ways to separate concerns
- concurrency incurs some overhead
- correct concurrency is complex
- concurrency bugs are hard to replicate
- concurrency often requires a fundamental change in design strategy

### Concurrency Myths and Misconceptions

- concurrency always improves performance
  - only when there is a lot of wait time that can be shared between multiple threads or processors
- design does not change when writing concurrent programs
  - decoupling *what* from *when* usually has a huge effect on the structure of the system
- understanding concurrency issues is not important when working with a container (web, ORM)

### Concurrency Defense Principles

#### Single Responsibility Principle

- a given method/class/component should have a single reason to change
- concurrent design is complex enough to be a reason to change so we should separate it from the rest of the code

#### Limit the Scope of the Data

- take data encapsulation to heart; severely limit the access of data that may be shared

#### Use Copies of Data

- good way to avoid shared data is to avoid sharing the data in the first place
- if possible, copy objects and treat them as read-only
- might be possible to copy objects, collect results from multiple threads in these copies and merge results in a single thread
- only copy data if it helps you avoid using locks

#### Threads Should be as Independent as Possible

- each thread should exist in its own world, sharing no data with any other thread
- each thread processes one client request, with all of the required data coming from an unshared source and stored as local variables
- attempt to partition data into independent subsets that can be operated on by independent threads, possibly in different processors

#### Know Your Library

#### Know Your Execution Methods

##### Definitions

**Bound Resource** - resource of a fixed size or number used in a concurrent environment. Examples include database connections and fixed-size read/write buffers

**Mutual Exclusion** - only one thread can access shared data or a shared resource at a time

**Starvation** - one thread or a group of threads is prohibited from proceeding for an excessively long time or forever. For example, always letting fast-running threads through first could starve out longer running threads if there is no end to the fast-running threads.

**Deadlock** - two or more threads waiting for each other to finish. Each thread has a resource that the other thread requires and neither can finish until it gets the other resource.

**Livelock** - threads in lockstep, each trying to do work but finding another "in the way."  Due to resonance, threads continue trying to make progress but are unable to for an excessively long time -- or forever.

##### [Producer-Consumer](https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem)

> One or more producer threads create some work and place it in a buffer or queue. One or more consumer threads acquire that work from the queue and complete it. The queue between the producers and consumers is a *bound resource*. This means producers must wait for free space in the queue before writing and consuemrs must wait until there is something in the queue to consume. Coordination between the producers and consumers via the queue involves producers and consumers signaling each other. The producers write to the queue and signal that the queue is no longer empty. Consumers read from the queue and signal that the queue is no longer full. Both potentially wait to be notified when they can continue.

##### [Readers-Writers](https://en.wikipedia.org/wiki/Readers%E2%80%93writers_problem)

> When you have a shared resource that primarily serves as a source of information fro readers, but which is occasionally updated by writers, throughput is an issue. Emphasizing throughput can cause starvation and the accumulation of stale information. Allowing updates can impact throughput. Coordinating readers so they do not read something a writer is updating and vice versa is a though balancing act. Writers tend to block many readers for a long period of time, thus causing throughput issues.
>
> The challenge is to balance the needs of both readers and writers to satisfy correct operation, provide reasonable throughput and avoiding starvation. A simple strategy makes writers wait until there are no readers before allowing the writer to perform an update. If there are continuous readers, however, the writers will be starved. On the other hand, if there are frequent writers and they are given priority, throughput will suffer. Finding that balance and avoiding concurrent update issues is what the problem addresses.


##### [Dining Philosophers](https://en.wikipedia.org/wiki/Dining_philosophers_problem)

> Image a number of philosophers sitting around a circular table. A fork is placed to the left of each philosopher. There is a big bowl of spaghetti in the center of the table. The philosophers spend their time thinking unless they get hungry. Once hungry, they pick up the forks on either side of them and eat. A philosopher cannot eat unless he is holding two forks. If the philosopher to his right or left is already using one of the forks he needs, he must wait until that philosopher finishes eating and puts the fork back down. Once a philosopher eats, he puts both his forks back down on the table and waits until he is hungry again.
>
> Replace philosophers with threads and forks with resources and this problem is similar to many enterprise application sin which processes compete for resources. Unless carefully designed, systems that compete in this way can experience deadlock, livelock, throughput, and efficiency degradation.

#### Beware Dependencies Between Synchronized Methods

- avoid using more than one method on a shared object
- there will be times when you must use more than one method on a shared object, when thi sis the case there are three ways to make the code correct:
  - client-based locking -- have the client lock the server before calling the first method and make sure the lock's extent includes code calling the last method
  - server-based locking -- within the server create a method that locks the server, calls all the methods, and then unlocks. Have the client call the new method
  - adapted server -- create an intermediary that performs the locking. This is an example of server-based locking, where the original server cannot be changed

#### Keep Synchronized Sections Small

- all sections of code guarded by the same lock are guaranteed to have only one thread executing through them at any given time
- locks are expensive because they create delays and add overhead

#### Writing Correct Shutdown Code is Hard

- writing a system that is meant to stay live and run forever is different from writing something that works for awhile and then shuts down gracefully
- think about shutdown early and get it working early, it's going to take longer than you expect

#### Testing Threaded Code

- write tests that have the potential to expose problems and then run them frequently, with different programmatic configurations and system configurations and load. If tests ever fail, track down the failure. Don't ignore a failure just because the tests pass on a subsequent run.
- do not ignore system failures as one-offs
- do not try to chase down non-threading bugs and threading bugs at the same time. Make sure your code works outside of threads
- make your thread-based code especially pluggable so that you can run it in various configurations
- find ways to time the performance of your system under different configurations
- things happen when the system switches between tasks. To encourage task swapping, run with more threads than processors or cores. THe more frequently your tasks swap, the more likely you'll encounter code that is missing a critical section or causes deadlock.
- run your threaded code on all target platforms early and often
- use automated instrumentation strategies (jigging) to ferret out errors

### Conclusion

> Concurrent code is difficult to get right. Code that is simple to follow can become nightmarish when multiple threads and shared data get into the mix. If you are faced with writing concurrent code, you need to write clean code with rigor or else face subtle and infrequent failures.
>
> First and foremost, follow the Single Responsibility Principle. Break your system into plain objects that separate thread-aware code from thread-ignorant code. Make sure when you are testing your thread-aware code, you are only testing it and nothing else. This suggests that your thread-aware code should be small and focused.
>
> Know the possible sources of concurrency issues: multiple threads operating on shared data, or using a common resource pool. Boundary cases, such as shutting down cleanly or finishing the iteration of a loop, can be especially thorny.
>
> Learn your library and know the fundamental algorithms. Understand how some of the features offered by the library support solving problems similar to the fundamental algorithms.
>
> Learn how to find regions of code that must be locked and lock them. Do not lock regions of code that do not need to be locked. Avoid calling one locked section from another. This requires a deep understanding of whether something is or is not shared. Keep the amount of shared objects and the scope fo the sharing as narrow as possible. Change designs of the objects with shared data to accommodate clients rather than forcing clients to manage shared state.
>
> Issues will crop up. THe ones that do not crop up early are often written off as a one-time occurrence. These so-called one-offs typically only happen under load or at seemingly random times. Therefore, you need to be able to run your thread-related code in many configurations on many platforms repeatedly and continuously. Testability, which comes naturally from  following the Three Laws of TDD, implies some level of plug-ability, which offers the support necessary to run code in a wider range of configurations.
>
> You will greatly improve your chances of finding erroneous code if you take the time to instrument your code. You can either do so by handing or using some kind of automated technology. Invest in this early. You want to be running your thread-based code as long as possible before ou plug it into production.
>
> If you take a clean approach, your chances of getting it right increase drastically.

## Chapter 14: Successive Refinement

- to write clean code, you must first write dirty code and then clean it
- write a rough draft, then a second draft, then several subsequent drafts until we have our final version
- writing clean compositions is a matter of successive refinement
- one of the best ways to ruin a program is to make massive changes to its structure in the name of improvements. The problem is that it's very hard to get the program working the same way it worked before the "improvements"
  - to avoid this problem, use TDD
  - it forces you to keep each change small and ensures your program works as intended
- putting things in so you can take them out again is pretty common in refactoring

### Conclusion

> It is not enough for your code to work. Code that works is often badly broken. PRogrammers who satisfy themselves with merely working code are behaving unprofessionally. They may fear that they don't have time to improve the structure and design of their code, but I disagree. Nothing has a more profound and long-term degrading effect upon a development program than bad code.
>
> Of course bad code can be cleaned up. Bt it's very expensive. As code rots, the modules insinuate themselves into each other, creating lots of hidden and tangled dependencies. Finding and breaking old dependencies is a long and arduous task. On the other hand, keeping code clean is relatively easy. If you made a mess in a module in the morning, it is easy to clean it up in the afternoon. Better yet, if you made a mess five minutes ago, it's very easy to clean it up right now.
>
> So the solution is to continuously keep your code as clean and simple as it can be. Never let the rot get started.

## Chapter 15: JUnit Internals

> No module is immune from improvement, and each of us has the responsibility to leave the code a little better than we found it

## Chapter 16: Refactoring `SerialDate`

> Code review is not an activity of nastiness or arrogance. What I am about to do is nothing more and nothing less than a professional review. It is something that we should all be comfortable doing. And it is something we should welcome when it is done for us. It is only through critiques like these that we will lern. Doctors do it. Pilots do it. Lawyers do it. And we programmers need to learn how to do it too.

## Chapter 17: Smells and Heuristics

### Comments

#### C1: Inappropriate Information

- comments should be reserved for technical notes about the code and design

#### C2: Obsolete Comment

- a comment that has gotten old, irrelevant, and incorrect is obsolete
- if you find an obsolete comment, it's best to update it or get rid of it as quickly as possible

#### C3: Redundant Comment

- comment that describes something that adequately describes itself
- comments should say things that the code cannot say for itself

#### C4: Poorly Written Comment

- if you are going to write a comment, take the time to make sure it is the best comment yu can write
- choose your words carefully
- use correct grammar and punctuation

#### C5: Commented-out Code

- worst practice because we have source control

### Environment

#### E1: Build Requires More Than One Step

- building a project should be a single trivial operation
- you should be able to check out the system with one simple command and then issue another simple command to build it

#### E2: Tests Require More Than One Step

- you should be able to run all the unit tests with just one command

### Functions

#### F1: Too Many Arguments

#### F2: Output Arguments

- if your function must change the state of something, have it change the state of the object it is called on

#### F3: Flag Arguments

#### F4: Dead Function

- methods that are never called should be discarded
- keeping dead code around is wasteful

### General

#### G1: Multiple Languages in One Source File

#### G2: Obvious Behavior is Unimplemented

- **Principle of Least Surprise** any function or call should implement the behaviors that another programmer could reasonably expect

#### G3: Incorrect Behavior at the Boundaries

- don't rely on your intuition, look for every boundary condition and write a test for it

#### G4: Overridden Safeties

- turning off failing tests and telling yourself you'll get them to pass later is as bad as pretending your credit cards are free money

#### G5: Duplication

- every time you see duplication in the code, it represents a missed opportunity for abstraction
- a more subtle form is the `switch/case` or `if/else` chain that appears again and again in various modules, always testing for the same set of conditions
  - this can be replaced with polymorphism

#### G6: Code at Wrong Level of Abstraction

#### G7: Base Classes Depending on Their Derivatives

#### G8: Too Much Information

> Well-defined modules have very small interfaces that allow you to do a lot with a little. Poorly defined modules have wide and deep interfaces that force you to use many different gestures to get simple thing done. A well-defined interface does not offer very many functions to depend upon, so coupling is low. A poorly defined interface provides lots of functions that you must call, so coupling is high.
>
> Hide your data. Hide your utility functions. Hide your constants and your temporaries. Don't create classes with lots of instance variables. Don't create lots of protected variables and functions for your subclasses. Concentrate on keeping interfaces very tight and small. Help keep coupling low by limiting information.

#### G9: Dead Code

- if you find code that is never executed, delete it from the system

#### G10: Vertical Separation

- variables and functions should be defined close to where they are used

#### G11: Inconsistency

- if you do something a certain way, do all similar things in the same way

#### G12: Clutter

- keep your source files clean, well-organized, and free of clutter

#### G13: Artificial Coupling

- things that don't depend upon each other should not be artificially coupled
- take the time to figure out where functions, constants, and variables ought to be declared
- don't just toss them in the most convenient place at hand and then leave them there

#### G14: Feature Envy

#### G15: Selector Arguments

#### G16: Obscured Intent

#### G17: Misplaced Responsibility

- code should be place where a reader would naturally expect it to be

#### G18: Inappropriate Static

#### G19: Use Explanatory Variables

- one of the most powerful ways to make a program readable is to break the calculations up into intermediate values that are held in variables with meaningful names
- more explanatory variables are generally better than fewer
- remarkable how an opaque module can suddenly become transparent simply by breaking the calculation up into well-named intermediate values

#### G20: Function Names Should Say What They Do

- if you have to look at the implementation (or documentation) of the function to know what it does, then you should work to find a better name or rearrange the functionality so that it can be placed in functions with better names

#### G21: Understand the Algorithm

- before you consider yourself to be done with a function, make sure you understand how it works
- it is not good enough that it passes all the tests, you must know how the solution is correct
- often the best way to gain this knowledge and understanding is to refactor the function into something that is so clean and expressive that it is obvious how it works

#### G22: Make Logical Dependencies Physical

#### G23: Prefer Polymorphism to `If/Else` or `Switch/Case`

- **One Switch Rule**: There may be no more than one switch statement for a given type of selection
- the cases in that switch statement must create polymorphic objects that take the place of other such switch statements in the rest of the system

#### G24: Follow Standard Conventions

#### G25: Replace Magic Numbers with Named Constants

- bad idea to have raw numbers in your code, you should hide them behind well-named constants

#### G26: Be Precise

- when you make a decision in your code, make sure you make it precisely
- know why you have made it and how you will deal with any exceptions
- don't be lazy about the precision of your decision

#### G27: Structure over Convention

- enforce design decisions with structure over convention
- naming conventions are good, but they are inferior to structures that force compliance

#### G28: Encapsulate Conditionals

- extract functions that explain the intent of the conditional

#### G29: Avoid Negative Conditionals

#### G30: Functions Should Do One Things

- functions that do more than one thing should be converted into smaller functions, each of which does one thing

#### G31: Hidden Temporal Couplings

- temporal couplings are often necessary, but you should not hide the coupling
- structure the arguments of your functions such that the order in which they should be called is obvious

#### G32: Don't Be Arbitrary

- have a reason for the way you structure your code, and make sure that reason is communicated by the structure of the code

#### G33: Encapsulate Boundary Conditions

- boundary conditions are hard to keep track of
- put the processing for them in one place, don't let them leak all over the code

#### G34: Functions Should Descend Only One Level of Abstraction

- when you break a function along the lines of abstraction, you often uncover new lines of abstraction that were obscured by the previous statement

#### G35: Keep Configurable Data at High Levels

#### G36: Avoid Transitive Navigation

- **Law of Demeter**: make sure that the modules know only about their immediate collaborators and do not know the navigation map of the whole system
  - **Writing Shy Code** in Pragmatic Programmer speak
- we want our immediate collaborators to offer all the services we  need
- should not have to roam through the object graph of the system, hunting for the method we want to call

### Names

#### N1: Choose Descriptive Names

- don't be too quick to choose a name
- make sure the name is descriptive
- meanings tend to drift as software evolves, so frequently reevaluate the appropriateness of the names you choose
- names in software are 90% of what makes software readable
- you need to take the time to choose them wisely and keep them relevant
- names are too important to create carelessly

#### N2: Choose Names at the Appropriate Level of Abstraction

- don't pick names that communicate implementation, choose names that reflect the level of abstraction of the class or function that you are working in
- making code readable requires a dedication to continuous improvement

#### N3: Use Standard Nomenclature Where Possible

- names are easier to understand if they are based on existing convention or usage
- teams will often invent their own standard system of names for a particular project
  - **ubiquitous language** for the project

#### N4: Unambiguous Names

- choose names that make the workings of a function or variable unambiguous

#### N5: Use Long Names for Long Scopes

- length of a name should be related to the length of the scope
- you can use very short variable names for tiny scopes, but for big scopes you should use longer names

#### N6: Avoid Encodings

- names should not be encoded with type or scope information

#### N7: Names Should Describe Side-Effects

- names should describe everything that a function, variable, or class is or does
- don't hide side effects with a name

### Tests

#### T1: Insufficient Tests

- a test suite should test everything that could possibly break
- tests are insufficient so long as there are conditions that have not been explored by the tests or calculations that have not been validated

#### T2: Use a Coverage Tool

- coverage tools report gaps in your testing strategy

#### T3: Don't Skip Trivial Tests

- they are easy to write and their documentation value is higher than the cost to produce them

#### T4: An Ignored Test is a Question about Ambiguity

- we can express our question about the requirements as a test that is commented out, or a test that annotated with `@pytest.mark.skip`

#### T5: Test Boundary Conditions

- we often get the middle of the algorithm right, but misjudge the boundary conditions

#### T6: Exhaustively Test Near Bugs

- bugs then to congregate
- when you find a bug in a function, it is wise to do an exhaustive test of that function
- the bug was probably not alone

#### T7: Patterns of Failure Are Revealing

#### T8: Test Coverage Patterns Can Be Revealing

- looking at code that is or is not executed by the passing test gives clues to why the failing tests fail

#### T9: Test Should be Fast

- a slow test is a test that won't get run

### Conclusion

> Clean code is not written by following a ste of rules. You don't become a software craftsman by learning a list of heuristics. Professionalism and craftsmanship come from values that drive disciplines

## Appendix A: Concurrency II

- atomic operation is an uninterruptible operation

### Client-Server Example

- where is time being spent, two possibilities:
  - I/O - using a socket, connecting to a database, waiting for virtual memory swapping, and so on
    - concurrency can increase efficiency: when one part is waiting for I/O, another part can use the wait time to process something else
  - Processor - numerical calculations, regular expressions processing, garbage collection, and so on
    - more processing hardware can improve throughput, adding threads will not increase number of CPU cycles so it will not go faster

### Single Responsibility Principle

- to keep concurrent systems clean, thread management should be kept to a few well-controlled places
- any code that manages threads should do nothing other than thread management

### Knowing Your Library

- if you are creating threads, use the `Executor` as it makes your code cleaner and easier to follow
  - the `Executor` framework will pool threads, resize automatically, and recreate threads if necessary
  - it supports `futures`, a concurrent programming construct
    - futures are useful when we need to execute multiple, independent operations and wait for both to finish
- modern processors have an operation typically called `Compare and Swap (CAS)`
  - locks are costly so this methodology will check to see if a situation occurs where multiple threads modify the same value

### Server-based locking

- reduces repeated code
- has better performance than client-based locking
- reduces possibility of errors
- encforces a single policy
- reduces scope of shared variables

### Deadlocks

- deadlock is when two threads are waiting for the other one to finish and send them work
- requires all four conditions:
  - Mutual Exclusion -- when multiple threads need to use the same resource and the resources cannot be used by multiple threads at the same time or are limited in number
  - Lock & Wait -- one thread acquires a resource, it will not release the resource until it has acquired all of the other resources it requires and has completed its work
  - No Preemption -- one thread cannot take away resources from another thread, only way to get it back is by having the holding thread release the resource
  - Circular Wait aka "the deadly embrace" -- image two threads (T1 and T2) and 2 resources (R1 and R2). T1 has R1 and T2 has R2. T1 also requires R2 and T2 also requires R1

#### Breaking Mutual Exclusion

- using resources that allow simultaneous use, atomic data structures
- increasing the number of resources such that it equals or exceeds the number of competing threads
- checking that all your resources are free before seizing any

#### Breaking Lock & Wait

- refuse to wait: check each resource before you seize it and release all resources and start over if you run into one that's busy
- leads to:
  - Starvation -- one thread being unable to acquire the resource it needs
  - Livelock -- several threads might get into lockstep and all acquire one resource and then release one resource, over and over again
- it's inefficiency, but a good last resource to implement if nothing else works

#### Breaking Preemption

- allow threads to take resources away from other threads via a request mechanism
- when a thread discovers that a resource is buys, it asks the owner to release it
  - if the owner is also waiting for some other resource, it releases them all and starts again
- like previous approach but a thread is allowed to wait for a resource
- managing requests is tricky

#### Breaking Circular Wait

- most common approach to preventing deadlock
- requires a simple convention agreed to by all parties
- if all threads can agree on a global ordering of resources and if they all allocate resources in that order, then deadlock is impossible
- problems:
  - order of acquisition might not correspond to the order of use
    - a resource acquired at the start might not be used until the end which means resources are locked longer than necessary
  - hard to impose an order on the acquisition of resources
    - if ID of second resource comes from an operation performed on the first, then ordering is not feasible
- isolating thread-related part of your solution to allow for tuning and experimentation is a powerful way to gain the insights needed to determine the best strategies

### Testing Multi-threaded Code

- hard to demonstrate broken code as it only happens very rarely
- Monte Carlo Testing -- make tests flexible so they can be tuned and log conditions under which tests failed
- run test on every one of the target deployment platforms
  - longer the tests run without failure, the more likely the code is correct
- run tests on a machine with varying loads
