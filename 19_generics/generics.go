package main

import "fmt"

/*
====================== GENERICS IN GO ======================

📌 Definition (Beginner Friendly):
Generics allow you to write functions and data structures
that can work with different data types
without writing duplicate code.

📌 Definition (Interview / Advanced):
Generics enable type-safe, reusable code by allowing
types to be parameterized at compile time.

👉 One code, many types, zero duplication.
===========================================================
*/

/*
====================== GENERIC FUNCTION ======================

[T any]
T → Type parameter (placeholder for any type)
any → means T can be any data type (int, string, struct, etc.)

Rule:
Both parameters must be of the SAME type T
*/
func swap[T any](x, y T) (T, T) {
	return y, x
}

/*
====================== STRUCT TYPES ======================
*/
type Person struct {
	Name string
	Age  int
}

type User struct {
	Name string
	Age  int
}

func main() {

	// ============================
	// 1️⃣ Using generics with int
	// ============================
	a, b := swap(1, 2)
	fmt.Println(a, b)

	// ============================
	// 2️⃣ Using generics with string
	// ============================
	c, d := swap("hello", "world")
	fmt.Println(c, d)

	// ============================
	// 3️⃣ Using generics with SAME struct type
	// ============================
	p1 := Person{"Siddharth", 21}
	p2 := Person{"Legend", 22}

	e, f := swap(p1, p2)
	fmt.Println(e, f)

	// ❌ This is NOT allowed (different types)
	// swap(Person{}, User{})
}
