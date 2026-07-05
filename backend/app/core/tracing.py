"""OpenTelemetry distributed tracing configuration."""
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from app.core.config import settings


def setup_tracing(app=None):
    """Configure OpenTelemetry tracing with Jaeger and OTLP exporters."""
    
    # Create resource with service name
    resource = Resource.create({
        "service.name": "magical-eye-api",
        "service.version": "1.0.0",
        "deployment.environment": settings.LOG_LEVEL.lower()
    })
    
    # Set up tracer provider
    tracer_provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(tracer_provider)
    
    # Add Jaeger exporter (if configured)
    jaeger_exporter = JaegerExporter(
        agent_host_name="localhost",
        agent_port=6831,
    )
    tracer_provider.add_span_processor(
        BatchSpanProcessor(jaeger_exporter)
    )
    
    # Add OTLP exporter (for OpenTelemetry Collector)
    otlp_exporter = OTLPSpanExporter(
        endpoint="http://localhost:4317",
        insecure=True,
    )
    tracer_provider.add_span_processor(
        BatchSpanProcessor(otlp_exporter)
    )
    
    # Instrument FastAPI
    if app:
        FastAPIInstrumentor.instrument_app(app)
    
    # Instrument SQLAlchemy
    from app.core.database import engine
    SQLAlchemyInstrumentor().instrument(
        engine=engine,
        tracer_provider=tracer_provider
    )
    
    return tracer_provider


def get_tracer():
    """Get a tracer instance."""
    return trace.get_tracer(__name__)
