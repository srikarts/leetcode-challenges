
def sum_two_numbers(a: float, b: float) -> float:
    """
    Returns the sum of two numbers.
    """
    return a + b

def main():
    print("=" * 40)
    print("        SUM OF TWO NUMBERS PROGRAM        ")
    print("=" * 40)
    try:
        num1_str = input("Enter the first number: ").strip()
        num2_str = input("Enter the second number: ").strip()
        
        # Convert inputs to float to support decimals as well as integers
        num1 = float(num1_str)
        num2 = float(num2_str)
        
        result = sum_two_numbers(num1, num2)
        
        # Format output: if result is a whole number, show it as an integer
        if result.is_integer():
            print(f"\nSuccess! The sum of {int(num1)} and {int(num2)} is: {int(result)}")
        else:
            print(f"\nSuccess! The sum of {num1} and {num2} is: {result}")
            
    except ValueError:
        print("\nError: Invalid input. Please enter valid numeric values.")
    print("=" * 40)

if __name__ == "__main__":
    main()
