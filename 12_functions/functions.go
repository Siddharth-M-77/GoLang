package main

import "fmt"

/*
	📌 FUNCTIONS IN GO (DEFINITION)

	Functions are reusable blocks of code
	that perform a specific task.

	✔ They can take parameters
	✔ They can return values
	✔ Improve code reusability
*/

func main() {

	result := sum(10, 10)
	fmt.Println("Sum:", result)

	total := add(20, 30)
	fmt.Println("Total:", total)

	// function as argument
	fn := func(n int) int {
		return n * n
	}

	output := processit(fn, 5)
	fmt.Println("Processed value:", output)
}

// sum function
func sum(x, y int) int {
	return x + y
}

// add function
func add(x, y int) int {
	return x + y
}

// function as parameter
func processit(fn func(int) int, value int) int {
	return fn(value)
}
