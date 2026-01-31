package main

import "fmt"

/*
====================== INTERFACE MENTAL MODEL ======================

INTERFACE   → Rule Book (WHAT to do)
STRUCT      → Worker (HOW to do)
SERVICE     → Boss (Business Logic)
main()      → Owner / HR (Decides which worker is used)

===================================================================
*/

/*
📌 INTERFACE (RULE BOOK)

Jo bhi payment karega,
usko Pay(amount) aana hi chahiye
*/
type PaymentGateway interface {
	Pay(amount float64) error
}

/*
====================== WORKERS ======================
Har worker rule book follow karta hai
*/

// 👷 Worker 1: Razorpay
type Razorpay struct{}

func (r *Razorpay) Pay(amount float64) error {
	fmt.Println("Payment done using Razorpay:", amount)
	return nil
}

// 👷 Worker 2: Stripe
type Stripe struct{}

func (s *Stripe) Pay(amount float64) error {
	fmt.Println("Payment done using Stripe:", amount)
	return nil
}

// 👷 Worker 3: Paypal
type Paypal struct{}

func (p *Paypal) Pay(amount float64) error {
	fmt.Println("Payment done using Paypal:", amount)
	return nil
}

/*
====================== BOSS ======================

Boss ko worker ka naam nahi chahiye
Boss ko bas rule book chahiye
*/
type PaymentService struct {
	gateway PaymentGateway
}

// Boss ka order

// adding method to PaymentService
func (p *PaymentService) MakePayment(amount float64) error {
	return p.gateway.Pay(amount)
}

/*
====================== OWNER / HR ======================
Yahin decide hota hai kaun sa worker kaam karega
*/
func main() {

	// 👨‍💼 Owner decides: Razorpay
	razorpay := &Razorpay{}
	paymentService := PaymentService{
		gateway: razorpay,
	}
	paymentService.MakePayment(100)

	// 👨‍💼 Owner switches to Stripe
	stripe := &Stripe{}
	paymentService.gateway = stripe
	paymentService.MakePayment(250)

	// 👨‍💼 Owner switches to Paypal
	paypal := &Paypal{}
	paymentService.gateway = paypal
	paymentService.MakePayment(500)
}
