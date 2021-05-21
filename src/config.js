const env = "local"

let createOrderUrl = "http://localhost/bigcommerce/create-order"

if (env === "staging") {
  createOrderUrl = "https://staging-pg.getwaave.co/bigcommerce/create-order"
}

if (env === "production") {
  createOrderUrl = "https://pg.getwaave.co/bigcommerce/create-order"
}

export default createOrderUrl