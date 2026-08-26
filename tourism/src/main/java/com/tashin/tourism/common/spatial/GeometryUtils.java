package com.tashin.tourism.common.spatial;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;

/**
 * Utility for creating JTS geometry objects compatible with PostGIS geography columns.
 *
 * Convention: longitude → X axis, latitude → Y axis (JTS/WGS84 standard).
 */
public final class GeometryUtils {

    private static final GeometryFactory FACTORY =
            new GeometryFactory(new PrecisionModel(), 4326);

    private GeometryUtils() {}

    /**
     * Create a PostGIS-compatible WGS84 Point.
     *
     * @param latitude  Y axis  (-90 to 90)
     * @param longitude X axis (-180 to 180)
     */
    public static Point createPoint(double latitude, double longitude) {
        Point point = FACTORY.createPoint(new Coordinate(longitude, latitude));
        point.setSRID(4326);
        return point;
    }
}
