// Replace Conditional with Polymorphism
// Transform type-checking switch/if statements into polymorphic classes

// =============================================================================
// BEFORE: Type checking with switch/if
// =============================================================================

// ❌ Type checking with switch/if - violates Open/Closed Principle
class EmployeeBefore {
  type: 'engineer' | 'manager' | 'salesperson';
  baseSalary: number;
  commission?: number;
  teamSize?: number;

  calculatePay(): number {
    switch (this.type) {
      case 'engineer':
        return this.baseSalary;
      case 'manager':
        return this.baseSalary + (this.teamSize ?? 0) * 100;
      case 'salesperson':
        return this.baseSalary + (this.commission ?? 0);
      default:
        throw new Error('Unknown employee type');
    }
  }

  getTitle(): string {
    switch (this.type) {
      case 'engineer':
        return 'Software Engineer';
      case 'manager':
        return 'Engineering Manager';
      case 'salesperson':
        return 'Sales Representative';
      default:
        return 'Employee';
    }
  }

  // Every new employee type requires modifying EVERY switch statement
  // This violates the Open/Closed Principle
}

// =============================================================================
// AFTER: Polymorphic solution
// =============================================================================

// ✅ Abstract base class defines the contract
abstract class Employee {
  constructor(protected baseSalary: number) {}

  abstract calculatePay(): number;
  abstract getTitle(): string;

  // Shared behavior stays in base class
  getBaseSalary(): number {
    return this.baseSalary;
  }
}

// ✅ Each type is its own class with specific behavior
class Engineer extends Employee {
  calculatePay(): number {
    return this.baseSalary;
  }

  getTitle(): string {
    return 'Software Engineer';
  }
}

class Manager extends Employee {
  constructor(baseSalary: number, private teamSize: number) {
    super(baseSalary);
  }

  calculatePay(): number {
    const BONUS_PER_REPORT = 100;
    return this.baseSalary + this.teamSize * BONUS_PER_REPORT;
  }

  getTitle(): string {
    return 'Engineering Manager';
  }

  // Manager-specific methods
  getTeamSize(): number {
    return this.teamSize;
  }
}

class Salesperson extends Employee {
  constructor(baseSalary: number, private commission: number) {
    super(baseSalary);
  }

  calculatePay(): number {
    return this.baseSalary + this.commission;
  }

  getTitle(): string {
    return 'Sales Representative';
  }

  // Salesperson-specific methods
  getCommission(): number {
    return this.commission;
  }
}

// ✅ Factory centralizes creation logic - ONE place for type switching
interface EmployeeData {
  baseSalary: number;
  teamSize?: number;
  commission?: number;
}

class EmployeeFactory {
  static create(type: string, data: EmployeeData): Employee {
    switch (type) {
      case 'engineer':
        return new Engineer(data.baseSalary);
      case 'manager':
        return new Manager(data.baseSalary, data.teamSize ?? 0);
      case 'salesperson':
        return new Salesperson(data.baseSalary, data.commission ?? 0);
      default:
        throw new Error(`Unknown employee type: ${type}`);
    }
  }
}

// =============================================================================
// Adding New Types - The Payoff
// =============================================================================

// ✅ Adding a new type is EASY - just add a new class
class Contractor extends Employee {
  constructor(
    baseSalary: number,
    private hourlyRate: number,
    private hoursWorked: number
  ) {
    super(baseSalary);
  }

  calculatePay(): number {
    return this.hourlyRate * this.hoursWorked;
  }

  getTitle(): string {
    return 'Independent Contractor';
  }
}

// Just update the factory
class EmployeeFactoryV2 {
  static create(type: string, data: any): Employee {
    switch (type) {
      case 'engineer':
        return new Engineer(data.baseSalary);
      case 'manager':
        return new Manager(data.baseSalary, data.teamSize ?? 0);
      case 'salesperson':
        return new Salesperson(data.baseSalary, data.commission ?? 0);
      case 'contractor':
        return new Contractor(0, data.hourlyRate, data.hoursWorked);
      default:
        throw new Error(`Unknown employee type: ${type}`);
    }
  }
}

// =============================================================================
// Usage Examples
// =============================================================================

function demonstratePolymorphism() {
  // Create different employee types
  const employees: Employee[] = [
    EmployeeFactory.create('engineer', { baseSalary: 100000 }),
    EmployeeFactory.create('manager', { baseSalary: 120000, teamSize: 5 }),
    EmployeeFactory.create('salesperson', { baseSalary: 60000, commission: 25000 }),
  ];

  // Polymorphic behavior - no type checking needed!
  for (const employee of employees) {
    console.log(`${employee.getTitle()}: $${employee.calculatePay()}`);
  }
  // Output:
  // Software Engineer: $100000
  // Engineering Manager: $120500
  // Sales Representative: $85000

  // Calculate total payroll - works with ANY employee type
  const totalPayroll = employees.reduce(
    (sum, emp) => sum + emp.calculatePay(),
    0
  );
  console.log(`Total Payroll: $${totalPayroll}`);
}

// =============================================================================
// When to Use This Pattern
// =============================================================================

/*
✅ USE WHEN:
- Same switch/if on type appears in multiple places
- Each type has different behavior for multiple operations
- New types are added frequently
- You want to follow Open/Closed Principle

❌ DON'T USE WHEN:
- Switch appears in only one place
- Types rarely change
- Behavior differences are minimal
- Would create too many small classes

RULE OF THUMB:
If you have switch(type) in 3+ places, or adding new types
requires changing multiple files, consider polymorphism.
*/

// =============================================================================
// Alternative: Strategy Pattern for Behavior Injection
// =============================================================================

// When you need to swap behavior at runtime, use Strategy
interface PayCalculationStrategy {
  calculate(baseSalary: number, context: any): number;
}

class HourlyPayStrategy implements PayCalculationStrategy {
  calculate(baseSalary: number, context: { hoursWorked: number }): number {
    const HOURLY_RATE = baseSalary / 2080; // Annual to hourly
    return HOURLY_RATE * context.hoursWorked;
  }
}

class SalaryPayStrategy implements PayCalculationStrategy {
  calculate(baseSalary: number): number {
    return baseSalary / 12; // Monthly salary
  }
}

class EmployeeWithStrategy {
  constructor(
    private baseSalary: number,
    private payStrategy: PayCalculationStrategy
  ) {}

  calculateMonthlyPay(context?: any): number {
    return this.payStrategy.calculate(this.baseSalary, context);
  }

  // Can change strategy at runtime
  setPayStrategy(strategy: PayCalculationStrategy): void {
    this.payStrategy = strategy;
  }
}
