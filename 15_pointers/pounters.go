package main

import "fmt"

/*
📌 POINTERS IN GO (COMPLETE DEFINITION)

A pointer is a variable that stores the memory address of another variable.

🔹 Why pointers are used?
✔ To modify original values inside functions
✔ To avoid copying large data structures (performance boost)
✔ To share data between functions efficiently

🔹 Important symbols
&  → address-of operator (gets memory address)
*  → dereference operator (access value at address)

🔹 Default value of a pointer is nil
*/

func main() {

	// =========================
	// 1️⃣ Basic pointer example
	// =========================
	var num int = 42
	var ptr *int = &num

	//where & num gets the address of num and assigns it to ptr

	fmt.Println("Value of num:", num)
	fmt.Println("Address of num:", &num)
	fmt.Println("Value stored in ptr (address):", ptr)
	fmt.Println("Dereferenced value of ptr:", *ptr)

	// =========================
	// 2️⃣ Pointer modifies original value
	// =========================
	num = 200
	result := changeNumber(&num)

	fmt.Println("After changeNumber call, num:", num)
	fmt.Println("Returned from changeNumber:", result)

	// =========================
	// 3️⃣ Nil pointer example
	// =========================
	var p *int
	fmt.Println("Nil pointer value:", p)

	// ⚠️ Uncommenting next line will cause runtime panic
	// fmt.Println(*p)
}

// =========================
// Function using pointer
// =========================
func changeNumber(num *int) int {
	*num = 100 // modifying original value
	fmt.Println("Inside changeNumber:", *num)
	return *num
}

// 📌 Interview One-Line Definition

// Pointer is a variable that holds the memory address of another variable, allowing direct modification of original data without copying.
