from django.core.management.base import BaseCommand

from store.models import Product, ProductSpecification
from store.text_utils import clean_config_string, clean_spec_text


class Command(BaseCommand):
    help = "Strip stray CR/LF artifacts out of Product.config and ProductSpecification.value. Safe to re-run."

    def handle(self, *args, **options):
        updated_products = 0
        for product in Product.objects.all():
            original = product.config or ''
            cleaned = clean_config_string(original)
            if cleaned != original:
                product.config = cleaned
                product.save(update_fields=['config'])
                updated_products += 1

        updated_specs = 0
        for spec in ProductSpecification.objects.all():
            original = spec.value or ''
            cleaned = clean_spec_text(original)
            if cleaned != original:
                spec.value = cleaned
                spec.save(update_fields=['value'])
                updated_specs += 1

        self.stdout.write(self.style.SUCCESS(
            f"Cleaned {updated_products} Product.config row(s) and "
            f"{updated_specs} ProductSpecification.value row(s)."
        ))
