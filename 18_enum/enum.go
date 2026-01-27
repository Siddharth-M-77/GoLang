package main

import "fmt"

/*
====================== ORDER STATUS (ENUM STYLE) ======================

OrderStatus ek custom type hai
jo order ki state define karta hai

0 → Confirmed
1 → Pending
2 → Cancelled
=====================================================================
*/

// OrderStatus = category / state
type OrderStatus int

// Possible order states
const (
	Confirmed OrderStatus = iota
	Pending
	Cancelled
)

/*
String() method
➡️ Ye status ko human-readable banata hai
➡️ fmt.Println automatically call karta hai
*/
func (s OrderStatus) String() string {
	switch s {
	case Confirmed:
		return "Confirmed"
	case Pending:
		return "Pending"
	case Cancelled:
		return "Cancelled"
	default:
		return "Unknown"
	}
}

/*
====================== BUSINESS LOGIC ======================
Boss function jo sirf OrderStatus ko accept karta hai
*/
func changeStatus(status OrderStatus) {
	fmt.Println("Status changed to:", status)
}

/*
====================== MAIN ======================
Decision yahin hota hai kaun sa status use hoga
*/
func main() {

	// Order created with Pending status
	status := Pending

	// Change order status
	changeStatus(status)

	// Change to Confirmed
	changeStatus(Confirmed)

	// Change to Cancelled
	changeStatus(Cancelled)
}
