# Data Science for Business
by Foster Provost and Tom Fawcett

---

## Chapter 1

**Data Analytic Thinking** is a problem solving methodology that applies a well-defined approach to extract useful knowledge from data in order to solve business problems.

## Chapter 2

Data mining is a process with well defined stages. We can break our task up into smaller subtasks. Apply a technique the matches best matches what we are trying to do, chapter has a brief discussion on algos. Put sub-results together in presentable way

CRISP data mining process. List steps.
1. Business Understanding
2. Data Understanding
3. Data Preparation
4. Modeling
5. Evaluation
6. Deployment

## Chapter 3: Intro to Predictive Modeling

One of the common tasks in analytics is finding which attributes correlate with the target of interest. When given a very large dataset, we can select a subset of of the data to analyze it; selecting the subset of attributes that are the most *informative* is a smart way to attack the problem

**Supervised learning** is when we create a model to describe the relationship between attributes and a predefined target.

> Common Problem: Supervised Segmentation (Theme)
>
> * Decision Tree... great for intuition
> Pros / Cons later

* Selecting Informative Attribute (use entropy. Information gain for classification problems. Variance for numeric problems). Ranking helps us:
  * Understand data better
  * Predict the target
  * Reduce size of data to analyze, select subset of attributes

## Chapter 4: Fitting a Model to Data

Tree-based models try to infer structure. There is also another way, take a parameterized model and use our data to fit the parameters.

Build different kinds of models, can get different kinds of insights from each

Fitting a model is a generalized approach that can be used for:

### Support Vector Machines

* Used to generate classification boundaries
* Main idea: have wide decision boundaries
* Basic idea is to penalize misclassifications using a hinge loss
  * If it's on the other side of the boundary, linear penalty

### Regression

* Predicting a numeric value
* Standard loss function uses sum of squared errors
  * Look at application, maybe absolute value makes sense

### Logistic Regression

* Predicting a class
* Uses a logit model to convert ```f(x)``` into a probability
  * Sigmoid function

## Chapter 5: Overfitting and Its Avoidance

If we have the flexibility to find patterns in a dataset, we will find them.. We want models to apply not just to the exact training set, but to the general population.

**Overfitting** is the tendency to tailor models to the training data vs generalizing to previously unseen data points. All algorithms overfit to some extent. Overfitting can be caused by training on the same data as we test against and overtly complex models (number of nodes for trees. number of attributes for regression).

### Avoiding Overfitting

* Holdout (splitting data into training and test sets)
* Cross-validation (splitting data into k partitions. Iterate thru k-1 training and k test sets)

### Avoiding Overfitting in Tree-Based Methods

  1. Stop growing tree before it gets too complex
    * Limit tree size by specify min # of instances that must be present in leaf
  2. Grow tree and then prune it back to reduce complexity
    * Estimate whether replacing a set of leaves or a branch with a leaf would reduce accuracy. If not, prune.

### General Method

Called **nested holdout procedure** or **nested cross-validation** depending on which we use.

#### Technique

* Split training set into subtraining and testing set (aka **validation set**)
* Build models on subtraining subset. Pick best model based on validation subset. **This steps tunes hyperparameters for model complexity**
* Build model with tuned parameters on entire training set (subtraining + validation)

### Regularization

For equations such as logistic regression, complexity can be controlled by choosing the "right" set of attributes.

Idea: Instead of just optimizing the fit to the data, we optimize an equation that is a combination of fit and simplicity. This is called **regularization**

We add a penalty to the objective function.

* **L1 penalty** <=> ridge
* **L2 penalty** <==> lasso
  * this ends up zeroing out coefficients

## Chapter 6: Similarity, Neighbors, and Clusters

If two things are similar, they often share other characteristics as well. The closer two objects are in feature space, the more similar they are. Need a way to measure distance and similarity .

### Distance Functions

* weighted contribution based on distance makes sense, not all neighbors should have same weight

* Euclidean (||L2||)
  * Most widely used
* Manhattan (||L1||)
  * Street distance
* Jaccard
  * Best for comparing objects with sets of characteristics
* Cosine
  * Useful in text processing (document analysis)
* Edit Distance / Levenshtein
  * min # of edits to convert one string into another

### Nearest Neighbors (aka most similar instances)

* Given a new example
* Scan thru training examples and find the "nearest neighbors"
* Use neighbor's data to predict example's target value
  * Task can be classification, probability estimation, or regression

#### Issues

* **Intelligibility** - lack of interpretable model
* **Dimensionality** - lots of features, many of them irrelevant
* **Computational Efficiency** - NN is fast because it stores only the instances, no need to build model

### Clustering

* Finding natural groupings in the data. "find groups of objects where the objects within groups are similar, but the objects in different groups are not so similar"

#### Hierarchical Clustering (dendogram)

* Formed by starting with each node as its own cluster
* Clusters are merged iteratively (using distance function) until only a single cluster remains

#### k-means

* Represent each cluster by its centroid
* Start with k initial cluster centers
* Clusters corresponding to centers are formed by figuring out the closest center to each point
* Cluster centers have shifted
* Recompute new clusters
* Repeat until convergence

**k-means will find local optimums** so do a bunch of random runs and average

Runtime is efficient since it only computers distances between each point and the cluster center

Can be used for EDA. What do the clusters mean? Make this into an interactive IPython widget.

### Using Supervised Learning to Generate Cluster Descriptions

* Do unsupervised learning to find clusters
* Use cluster assignments as class labels
* Run a supervised learning algorithm to generate a classifier for each class/cluster
* Inspect classifier description to get a description of the cluster

Not guaranteed to work all the time. Think about **intelligibility**
