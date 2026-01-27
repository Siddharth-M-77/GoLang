package main

import (
	"fmt"
	"time"
)

/*
📌 STRUCTS IN GO (PROJECT-READY DEFINITION)

A struct in Go is a user-defined composite data type
used to group logically related fields of different data types
into a single reusable and meaningful data structure.

👉 Think of struct as:
"Single source of truth for a data model"
*/

// ============================
// Person Model
// ============================
type Person struct {
	name      string // private (same package only)
	age       int
	dob       string
	createdAt time.Time
}

// ============================
// Methods on Person
// ============================
func (p *Person) changeAge(newAge int) int {
	p.age = newAge
	return p.age
}

func (p *Person) getName() string {
	return p.name
}

func (p *Person) getAge() int {
	return p.age
}

// ============================
// Register Request / Response
// ============================
type RegisterRequestSimple struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
	Dob  string `json:"dob"`
}

type RegisterResponse struct {
	Name string `json:"name"`
	Age  int    `json:"age"`
	Dob  string `json:"dob"`
}

// ============================
// Register Request Validation
// ============================
type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"min=8"`
}

// ============================
// EMBEDDING (Clean Architecture)
// ============================
type User struct {
	*Person
	Email    string
	Password string
}

//embedding in struct

type Order struct {
	name   string
	age    int
	person Person
}

func main() {

	// ============================
	// 1️⃣ Struct Initialization
	// ============================
	person := Person{
		name:      "Siddharth",
		age:       21,
		dob:       "01-01-2002",
		createdAt: time.Now(),
	}

	fmt.Println("Person:", person)

	// ============================
	// 2️⃣ Modify field directly
	// ============================
	person.age = 22
	fmt.Println("Updated age:", person.age)

	// ============================
	// 3️⃣ Zero value behavior
	// ============================
	var emptyPerson Person
	fmt.Println("Zero value struct:", emptyPerson)

	// ============================
	// 4️⃣ Methods usage
	// ============================
	newAge := person.changeAge(25)
	fmt.Println("Changed Age using method:", newAge)

	fmt.Println("Name using method:", person.getName())
	fmt.Println("Age using method:", person.getAge())

	// ============================
	// 5️⃣ Register Request / Response
	// ============================
	req := RegisterRequestSimple{
		Name: "Alice",
		Age:  30,
		Dob:  "15-05-1993",
	}
	fmt.Println("Register Request:", req)

	resp := RegisterResponse{
		Name: req.Name,
		Age:  req.Age,
		Dob:  req.Dob,
	}
	fmt.Println("Register Response:", resp)

	// ============================
	// 6️⃣ Validation Request Example
	// ============================
	registerReq := RegisterRequest{
		Email:    "dXj0j@example.com",
		Password: "password123",
	}
	fmt.Println("Register Validation Request:", registerReq)

	// ============================
	// 7️⃣ Embedding Example
	// ============================
	user := User{
		Person:   &person,
		Email:    "dXj0j@example.com",
		Password: "password123",
	}
	fmt.Println("User with embedded Person:", user)

	// ============================
	// 8️⃣ Embedding in Struct Example
	// ============================
	order := Order{
		name:   "SiDD",
		age:    20,
		person: person,
	}
	fmt.Println("Order with embedded Person:", order.person.dob)
}
