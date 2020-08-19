from django.db import models
from django.contrib.auth.models import User


class List(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lists")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        pass
        #unique_together = [['user', 'name']]

class Word(models.Model):
    
    text = models.TextField()
    meaning = models.TextField(blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    origin_title = models.TextField(blank=True, null=True)
    translation = models.TextField(blank=True, null=True)
    related = models.TextField(blank=True, null=True)
    sentence = models.TextField(blank=True, null=True)
    paragraph = models.TextField(blank=True, null=True)
    difficulty = models.CharField(max_length=20, blank=True, null=True)
    language = models.CharField(max_length=20, blank=True, null=True)
    reviewed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="words")
    wordlist = models.ForeignKey(List, on_delete=models.SET_NULL, null=True, blank=True, related_name="words")
    created_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return self.text

    class Meta:
        ordering = ['-created_at']
        # unique_together = [['user', 'text']]