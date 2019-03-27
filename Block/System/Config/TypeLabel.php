<?php
/**
 * Created by PhpStorm.
 * User: dev
 * Date: 12/7/18
 * Time: 7:37 AM
 */

namespace HawkSearch\Proxy\Block\System\Config;


class TypeLabel extends \Magento\Config\Block\System\Config\Form\Field\FieldArray\AbstractFieldArray
{
    protected function _prepareToRender()
    {
        $this->addColumn('title', ['label' => 'Title']);
        $this->addColumn('code', ['label' => 'Code']);
        $this->addColumn('color', ['label' => 'Background Color']);
        $this->addColumn('textColor', ['label' => 'Text Color']);
        $this->_addButtonLabel = 'Add';
        $this->_addAfter = false;
        parent::_prepareToRender();
    }
}