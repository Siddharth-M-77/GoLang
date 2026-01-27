package main 
import "fmt"

/*
	📌 VARIADIC FUNCTIONS IN GO (DEFINITION)

	A variadic function is a function that can take a variable number of arguments.
	✔ They are useful when you don't know the number of arguments in advance.
	✔ In Go, you can define a variadic function by using an ellipsis (...) before the parameter type.
*/


func main() {

	// ==============================
	// 1️⃣ Variadic function example
	// sum function
	

	slice := []int{1, 2, 3, 4, 5}

	result := sum(slice...)
	fmt.Println("Sum:", result)
}

func sum(nums ...int) int {
		total := 0
		for index,value := range nums {
			total += value
			fmt.Println("index:", index, "value:", value)
		}
		return total
	}