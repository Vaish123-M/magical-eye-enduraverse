"""Drift monitoring for prediction confidence tracking."""
from datetime import datetime, timedelta
from typing import List, Dict
import json
from pathlib import Path


class DriftMonitor:
    """Monitor prediction confidence over time to detect drift."""
    
    def __init__(self, log_file: str = "drift_monitoring.json", threshold: float = 0.6):
        self.log_file = Path(log_file)
        self.threshold = threshold
        self.predictions: List[Dict] = []
        self._load_existing()
    
    def _load_existing(self):
        """Load existing predictions from log file."""
        if self.log_file.exists():
            try:
                with open(self.log_file, 'r') as f:
                    data = json.load(f)
                    self.predictions = data.get('predictions', [])
            except Exception:
                self.predictions = []
    
    def _save_predictions(self):
        """Save predictions to log file."""
        self.log_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.log_file, 'w') as f:
            json.dump({
                'predictions': self.predictions,
                'last_updated': datetime.utcnow().isoformat()
            }, f, indent=2)
    
    def log_prediction(self, prediction: Dict, confidence: float, inspection_id: str = None):
        """Log a prediction with confidence score."""
        entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'prediction': prediction,
            'confidence': confidence,
            'inspection_id': inspection_id,
            'flagged': confidence < self.threshold
        }
        
        self.predictions.append(entry)
        
        # Keep only last 1000 predictions to manage file size
        if len(self.predictions) > 1000:
            self.predictions = self.predictions[-1000:]
        
        self._save_predictions()
        
        return entry['flagged']
    
    def get_recent_predictions(self, hours: int = 24) -> List[Dict]:
        """Get predictions from the last N hours."""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        cutoff_str = cutoff.isoformat()
        
        return [
            p for p in self.predictions 
            if p['timestamp'] >= cutoff_str
        ]
    
    def get_drift_metrics(self, hours: int = 24) -> Dict:
        """Calculate drift metrics for recent predictions."""
        recent = self.get_recent_predictions(hours)
        
        if not recent:
            return {
                'total_predictions': 0,
                'avg_confidence': 0.0,
                'flagged_count': 0,
                'flagged_percentage': 0.0
            }
        
        confidences = [p['confidence'] for p in recent]
        flagged = [p for p in recent if p['flagged']]
        
        return {
            'total_predictions': len(recent),
            'avg_confidence': sum(confidences) / len(confidences),
            'min_confidence': min(confidences),
            'max_confidence': max(confidences),
            'flagged_count': len(flagged),
            'flagged_percentage': (len(flagged) / len(recent)) * 100,
            'period_hours': hours
        }
    
    def get_flagged_predictions(self, hours: int = 24) -> List[Dict]:
        """Get all flagged predictions from the last N hours."""
        recent = self.get_recent_predictions(hours)
        return [p for p in recent if p['flagged']]


# Global drift monitor instance
drift_monitor = DriftMonitor()
