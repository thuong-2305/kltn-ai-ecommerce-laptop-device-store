from django.shortcuts import render
from . import recommend_system

top_product_recommend = 5

def recommend(request, index):
    products = recommend_system.get_products_similar(index, top_product_recommend)
    return render(request, 'recommend.html', {'products':products})