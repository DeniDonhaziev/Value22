const axios = require('axios');

async function testAPI() {
  try {
    console.log('Тестируем API магазинов...');
    
    // Получаем все магазины
    const shopsResponse = await axios.get('http://localhost:5000/api/shops');
    console.log('Все магазины:', shopsResponse.data.shops.length);
    
    if (shopsResponse.data.shops.length > 0) {
      const firstShop = shopsResponse.data.shops[0];
      console.log('Первый магазин:', firstShop);
      
      // Получаем товары первого магазина
      const productsResponse = await axios.get(`http://localhost:5000/api/shops/${firstShop.id}/products`);
      console.log('Товары магазина:', productsResponse.data.products.length);
      console.log('Товары:', productsResponse.data.products);
    }
    
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error.message);
  }
}

testAPI();

