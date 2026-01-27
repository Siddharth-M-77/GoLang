package main

import "fmt"

/*
	📌 IF–ELSE IN GO

	if-else is a conditional statement used
	to execute code based on conditions.

	✅ Conditions must be boolean
	❌ No parentheses required
*/

func main() {

	// ==============================
	// 1️⃣ Basic if–else
	// ==============================
	age := 18

	if age >= 18 {
		fmt.Println("You are an adult.")
	} else {
		fmt.Println("You are a minor.")
	}

	// ==============================
	// 2️⃣ if – else if – else
	// ==============================
	score := 85

	if score >= 90 {
		fmt.Println("Grade: A")
	} else if score >= 80 {
		fmt.Println("Grade: B")
	} else if score >= 70 {
		fmt.Println("Grade: C")
	} else {
		fmt.Println("Grade: F")
	}

	// ==============================
	// 3️⃣ Even / Odd check
	// ==============================
	n := 7

	if n%2 == 0 {
		fmt.Println(n, "is an even number")
	} else {
		fmt.Println(n, "is an odd number")
	}

	// ==============================
	// 4️⃣ Positive / Negative / Zero
	// ==============================
	num := -5

	if num > 0 {
		fmt.Println(num, "is a positive number")
	} else if num < 0 {
		fmt.Println(num, "is a negative number")
	} else {
		fmt.Println("The number is zero")
	}

	// ==============================
	// 5️⃣ Short statement if (IMPORTANT)
	// ==============================
	if x := 10; x > 5 {
		fmt.Println("x is greater than 5")
	} else {
		fmt.Println("x is less than or equal to 5")
	}
	// x is NOT accessible here ❌

	// ==============================
	// 6️⃣ Multiple conditions
	// ==============================
	username := "admin"
	password := "1234"

	if username == "admin" && password == "1234" {
		fmt.Println("Login successful")
	} else {
		fmt.Println("Invalid credentials")
	}

	// ==============================
	// 7️⃣ Nested if
	// ==============================
	marks := 92

	if marks >= 50 {
		if marks >= 90 {
			fmt.Println("Pass with distinction")
		} else {
			fmt.Println("Pass")
		}
	} else {
		fmt.Println("Fail")
	}
}
