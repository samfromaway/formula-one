import React from 'react';
import { Grid } from '@mui/material';

type MaxColumns = { xs: number; sm: number; md: number; lg: number };
type RowStartAlignment = 'left' | 'center';

type DynamicGridProps = {
  children: React.ReactNode & { length: number };
  maxColumns: MaxColumns;
  rowStartAlignment?: RowStartAlignment;
  fullWidth?: boolean;
  spacing?: number;
  columnSpacing?: number;
  rowSpacing?: number;
};

const defaultProps = { rowStartAlignment: 'left' };

const ROW_BASE = 12;

const DynamicGrid = ({
  children,
  maxColumns,
  spacing,
  columnSpacing,
  rowSpacing,
  fullWidth,
  rowStartAlignment,
}: DynamicGridProps) => {
  const gridChildren = React.Children.map(children, (child) => {
    const rowNumber = (columnsNr: number) => {
      if (!fullWidth) return undefined;
      if (children.length > columnsNr) {
        return ROW_BASE / columnsNr;
      }
      return ROW_BASE / children.length;
    };

    const width = (maxColumns: MaxColumns) => {
      if (fullWidth) return undefined;

      const makeWidth = (columnsNr: number) => 1 / columnsNr;

      return [
        makeWidth(maxColumns.xs),
        makeWidth(maxColumns.sm),
        makeWidth(maxColumns.md),
        makeWidth(maxColumns.lg),
      ];
    };

    return (
      <Grid
        item
        xs={rowNumber(maxColumns.xs)}
        sm={rowNumber(maxColumns.sm)}
        md={rowNumber(maxColumns.md)}
        lg={rowNumber(maxColumns.lg)}
        width={width(maxColumns)}
      >
        {child}
      </Grid>
    );
  });

  const makeStyle = (columnsNr: number) => {
    if (!gridChildren) return undefined;
    return gridChildren.length > columnsNr ? 'left' : 'center';
  };

  const justifyContent = () => {
    if (
      !gridChildren ||
      gridChildren.length === 0 ||
      rowStartAlignment === 'center'
    ) {
      return 'center';
    }

    return [
      makeStyle(maxColumns.xs),
      makeStyle(maxColumns.sm),
      makeStyle(maxColumns.md),
      makeStyle(maxColumns.lg),
    ];
  };

  return (
    <Grid
      container
      spacing={spacing}
      columnSpacing={columnSpacing}
      rowSpacing={rowSpacing}
      justifyContent={justifyContent()}
    >
      {gridChildren}
    </Grid>
  );
};

DynamicGrid.defaultProps = defaultProps;

export default DynamicGrid;
