package main

import "fmt"

// ==============================
// MAIN FUNCTION
// // ==============================
// 🔹 What is an Array?

// An array is a fixed-size collection of elements of the same type, stored in contiguous memory locations.
func main() {

	/*
		📌 ARRAY IN GO
		An array is a fixed-size collection of elements
		of the same data type.

		👉 Size is part of the type
		👉 Length cannot change
	*/

	// ==============================
	// 1️⃣ Array Declaration
	// ==============================
	var arr [5]int // default value of int = 0
	fmt.Println("Empty int array:", arr)

	// ==============================
	// 2️⃣ Assigning values
	// ==============================
	arr[0] = 10
	arr[1] = 20
	fmt.Println("After assigning values:", arr)

	// ==============================
	// 3️⃣ Length of array
	// ==============================
	fmt.Println("Length of array:", len(arr))

	// ==============================
	// 4️⃣ Array declaration + initialization
	// ==============================
	numbers := [5]int{1, 2, 3, 4, 5}
	fmt.Println("Initialized array:", numbers)

	// ==============================
	// 5️⃣ Partial initialization
	// Remaining values get zero value
	// ==============================
	partial := [5]int{1, 2}
	fmt.Println("Partially initialized array:", partial)

	// ==============================
	// 6️⃣ Default values in arrays
	// ==============================

	// int → 0
	var intArr [3]int
	fmt.Println("Default int array:", intArr)

	// string → ""
	var strArr [3]string
	fmt.Println("Default string array:", strArr)

	// bool → false
	var boolArr [3]bool
	fmt.Println("Default bool array:", boolArr)

	// ==============================
	// 7️⃣ Array with inferred size
	// Compiler decides size automatically
	// ==============================
	autoSize := [...]int{10, 20, 30, 40}
	fmt.Println("Auto-sized array:", autoSize)
	fmt.Println("Length:", len(autoSize))

	// ==============================
	// 8️⃣ Iterating over array
	// ==============================
	fmt.Println("Iterating array:")
	for i, value := range numbers {
		fmt.Printf("Index %d → Value %d\n", i, value)
	}

	// ==============================
	// 9️⃣ 2D Array (Matrix)
	// ==============================
	matrix := [2][2]int{
		{1, 2},
		{3, 4},
	}
	fmt.Println("2D Array:", matrix)

	/*
		matrix representation:
		[
		  [1 2]
		  [3 4]
		]
	*/

	// Accessing element
	fmt.Println("Element at [1][0]:", matrix[1][0])
}
