package main

import "fmt"

/*
	📌 CLOSURES IN GO (DEFINITION)
	A closure is a function that captures variables from its surrounding scope.
	✔ Closures can access and modify variables defined outside their own scope.
	✔ They are useful for creating function factories and maintaining state.
*/

func main() {
	result := closureExample()
	fmt.Println(result())
	fmt.Println(result())
}

func closureExample() func() int {
	count := 0
	return func() int {
		count++
		return count
	}
}
