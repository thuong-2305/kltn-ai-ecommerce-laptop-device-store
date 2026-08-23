from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from store.models import Review
from store.sentiment import SentimentAnalyzer


class Command(BaseCommand):
    help = "Recompute Review.sentiment / score_analysis for all reviews via SentimentAnalyzer."

    def add_arguments(self, parser):
        parser.add_argument(
            '--batch-size', type=int, default=200,
            help='How many updated rows to bulk_update at a time.',
        )

    def handle(self, *args, **options):
        batch_size = options['batch_size']

        model_ready = SentimentAnalyzer.load_model()
        if model_ready:
            self.stdout.write(self.style.SUCCESS("Using the real DistilPhoBERT text model."))
        else:
            self.stdout.write(self.style.WARNING(
                "ML model not available - falling back to rating-based sentiment "
                "(same result as before)."
            ))

        reviews = list(Review.objects.all())
        total = len(reviews)
        changed = 0
        to_update = []

        for i, review in enumerate(reviews, start=1):
            label, confidence = SentimentAnalyzer.analyze(review.comment or '', rating=review.rating)
            new_score = Decimal(str(round(confidence, 5)))
            if review.sentiment != label or review.score_analysis != new_score:
                review.sentiment = label
                review.score_analysis = new_score
                to_update.append(review)
                changed += 1

            if len(to_update) >= batch_size:
                with transaction.atomic():
                    Review.objects.bulk_update(to_update, ['sentiment', 'score_analysis'])
                to_update = []

            if i % 200 == 0 or i == total:
                self.stdout.write(f"Processed {i}/{total}...")

        if to_update:
            with transaction.atomic():
                Review.objects.bulk_update(to_update, ['sentiment', 'score_analysis'])

        self.stdout.write(self.style.SUCCESS(
            f"Done. {changed}/{total} review(s) had their sentiment label updated."
        ))
