const userRouter = require("./userRoutes/user.routes.js");
const categoryAdminRouter = require("./adminRoutes/category.admin.routes.js");
const categoryBuyerRouter = require("./buyerRoutes/category.buyer.routes.js");
const subCategoryAdminRouter = require("./adminRoutes/subCategory.admin.routes.js");
const subCategoryBuyerRouter = require("./buyerRoutes/subCategory.buyer.routes.js");
const productsAdminRouter = require("./adminRoutes/product.admin.routes.js");
const productsBuyerRouter = require("./buyerRoutes/product.buyer.routes.js");
const wishlistBuyerRouter = require("./buyerRoutes/wishlist.buyer.routes.js");
const cartBuyerRouter = require("./buyerRoutes/cart.buyer.routes.js");
module.exports = [
    { path: "/api/v1/users", handler: userRouter },
    { path: "/api/v1/admin/categories", handler: categoryAdminRouter },
    { path: "/api/v1/buyer/categories", handler: categoryBuyerRouter },
    { path: "/api/v1/admin/subcategories", handler: subCategoryAdminRouter },
    { path: "/api/v1/buyer/subcategories", handler: subCategoryBuyerRouter },
    { path: "/api/v1/admin/products", handler: productsAdminRouter },
    { path: "/api/v1/buyer/products", handler: productsBuyerRouter },
    { path: "/api/v1/buyer/wishlist", handler: wishlistBuyerRouter },
    { path: "/api/v1/buyer/cart", handler: cartBuyerRouter },
];
