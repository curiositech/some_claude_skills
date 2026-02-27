# Design Patterns
Elements of Reusable Object-Oriented Software

By Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides

#### Table of Contents

<!-- TOC -->

- [Chapter 1: Introduction](#chapter-1-introduction)
  - [What is a Design Pattern?](#what-is-a-design-pattern)
  - [Organizing the Catalog](#organizing-the-catalog)
  - [How Design Patterns Solve Design Problems](#how-design-patterns-solve-design-problems)
  - [Conclusion](#conclusion)
- [Facade](#facade)
  - [Uses](#uses)
  - [Collaborations](#collaborations)
  - [Consequences](#consequences)

<!-- /TOC -->

## Chapter 1: Introduction

### What is a Design Pattern?

A pattern has 4 essential elements:

1. **pattern name** is a handle we can use to describe a design problem, its solutions, and consequences in a word or two. It lets us design at a higher level of abstraction
2. **problem** describes when to apply the patter
3. **solution** describes the element that makes up the design, their relationships, responsibilities, and collaborations
4. **consequences** are the results and trade-offs of apply the pattern. Though consequences are often unvoiced when we describe design decisions, they are critical for evaluating design alternatives and for understanding the costs and benefits of apply the pattern

- design patterns are descriptions of communicating objects and classes that are customized to solve a general design problem in a particular context

### Organizing the Catalog

#### Purpose

Reflects what a pattern does

**creational** - cocnern the process of object creation
**structural** - deal with the composition of classes or objects
**behavioral** -- characterize the ways in which classes or objects interact and distribute responsibility

#### Scope

Specifies whether the pattern applies primarily to classes or to objects

- **class patterns** are established through inheritance so they are fixed at compile time
- **object patterns** deal with object relationships which are changed at run-time and are more dynamic

### How Design Patterns Solve Design Problems

#### Finding Appropriate Objects

- **object** packages both data and procedures that operate on that data
- procedures are called **methods** or **operations**
- an object performs an operation when it receives a **request** (or **message**) from a client
- requests are the only way to get an object to execute an operation
- operations are the only way to change an object's internal data
- this means that an object's internal state is **encapsulated** - it cannot be accessed directly, and its representation is invisible from outside the object

#### Specifying Object Interfaces

- the set of all signatures defined by an object's operations is called the **interface** to the object
- interfaces are fundamental in object-oriented systems; objects are only known thru their interface. There is no way to know anything about an object or to ask it to do anything without going through its interace
- run-time association of a request to an object and one of its operations is known as **dynamic binding**
  - issuing a request doesn't commit you to a particular implementation until run-time
  - you can substitute objects with identical interfaces for each other at run-time - **polymorphism**
- design patterns help you define interfaces by identifying their key elements and the kinds of data that get sent across an interface
- design patterns also specify relationships between interfaces

#### Class versus Interface Inheritance

- class inheritance defines an object's implemtnation in terms of another object's implemtnation - it's a mechanism for code and representation sharing
- interface inheritance (or subtyping) describes when an object can be used in place of another

#### Programming to an Interface, not an Implementation

- class inheritance is basically just a mechanism for extending an application's functionality by reusing functionality in parent classes
  - you can define a new kind of object rapidly in terms of an old man
  - get new implementations almost for free, inheriting most of what you need from existing classes
- when inheritance is used carefully, all classes derived from an abstract class will share its interface
  - this implies a subclass merely adds or overrides operations and does not hide operations of the parent class
  - all subclasses can respond to requests in the interface of this abstract class, making t hem all subtypes of the abstract class
- benefits of using the interface
  - clients remain unaware of the specific types of objects they use, as long as the objects adhere to the interface that clients expect
  - clients remain unaware of the classes that implement these objects = clients only know about the abstract classes defining the interface
- variables should be defined by an abstract class, or interface

#### Interitance versus Composition

- object composition is an alternative to class inheritance - new functionality is obtained by assembling or composing objects to get more complex functionality
- class inheritance is defined statically at compile-time; it makes it easy to modify the implementation being reused
  - "inheritance breaks encapsulation" - inheritance exposes a subclass to details of its parent's implemtnation
  - implementation dependencies can cause problems when you're trying to reuse a subclass - this limits flexibility and ultimately reusability
- object composition is defined dynamically at run-time through objects acquiring references to other objects
- any object can be replaced at run-time by another as long as it has the same type
- favuoring object composition over class inheritance helps keep each class encapsulated and focused on one task

#### Delegation

- a way of making composition as powerful for reuse as inheritance
- two objects are involved in handling a request: a receiving object delates operations to its delegate
  - the receiver passes itself to the delegate to let the delegated operation refer to the receiver
- complex abstractions are harder to understand than static software

#### Inheritance versus Parameterized Types

- object composition lets you change the behavior being composed at run-time, but it also requires indirection and can be less efficient
- inheritance lets you provide default implementations for operations and lets subclasses override them
- parameterized types let you change the types that a class can use
  - special kind of generic

#### Relating Run-Time and Compile-Time Structures

- An object-oriented program's run-time structure often bears little resemblance to its code structure
- code structure is frozen at compile-time, it consists of classes in fixed inheritance relationships
- program's run-time strucutre consists of rapidly changing network of communicating ojbects
- relationships between objects and their types must be designed with great care, because they determine how good or bad the run-time structure is

#### Designing for Change

- classes that are tightly coupled are hard to reuse in isolation, since they depend on each other
- time coupling leads to monolithic systems where you cant' cahnge or remove a class without understanding and changing many other classes
- lose coupling increases the probability that a class can be reused by itself
- design patterns use techniques such as abstract coupling and layering to promote loosely coupled systems
- looser coupling boosts the likelihood that one class of object can cooperate with several others
- design patterns make an application more maintainable when they've used to limit platform dependencies and to layer a system

### Conclusion

- design patterns should not be applied indiscriminately - often they achieve flexibility and variability by introducing additional levels of indirection, and that can complicate a design and/or cost you some performance
- a design pattern should only be applied when the flexibility it affords is actually needed

## Facade

- defines a higher-level interface that makes the subsystem easier to use
- make life easier for most programmers without hiding the lower-level functionality from the few that need it

### Uses

- provide a simple interface to a complex subsystem
- decouple subsytem from clients
- use a facade to define layers to your subsystem

### Collaborations

- clients communicate with the subsystem by sending requests to Facade which forwards them to the appropriate subsystem objects; might have to do work to translate its interface to subsystem interfaces
- clients that use facade don't have access to its subsystems objects directly

### Consequences

- shields clients from subsystem components, reducing the number of objects that a client deals with / makes subsystem easier to use
- promotes weak coupling between subsystem and its clients
