<?php

namespace HawkSearch\Proxy\Setup;

use Magento\Framework\App\Config\ConfigResource\ConfigInterface;
use Magento\Framework\Setup\ModuleContextInterface;
use Magento\Framework\Setup\ModuleDataSetupInterface;
use Magento\Catalog\Setup\CategorySetupFactory;

class UpgradeData implements \Magento\Framework\Setup\UpgradeDataInterface
{
    /**
     * Category setup factory
     *
     * @var CategorySetupFactory
     */
    private $categorySetupFactory;
    /**
     * @var ConfigInterface
     */
    private $config;

    /**
     * Init
     *
     * @param CategorySetupFactory $categorySetupFactory
     * @param ConfigInterface $config
     */
    public function __construct(CategorySetupFactory $categorySetupFactory, ConfigInterface $config)
    {
        $this->categorySetupFactory = $categorySetupFactory;
        $this->config = $config;
    }

    /**
     * {@inheritdoc}
     * @SuppressWarnings(PHPMD.ExcessiveMethodLength)
     */

    public function upgrade(ModuleDataSetupInterface $setup, ModuleContextInterface $context)
    {
        $setup->startSetup();
        if (version_compare($context->getVersion(), '2.1.2', '<')) {
            $this->upgradeTo_212($setup);
        }
        if(version_compare($context->getVersion(), '2.2.0', '<')) {
            $this->upgradeTo_220($setup);
        }
        $setup->endSetup();
    }
    private function upgradeTo_212(ModuleDataSetupInterface $setup) {
        $categorySetup = $this->categorySetupFactory->create(['setup' => $setup]);
        $entityTypeId = $categorySetup->getEntityTypeId(\Magento\Catalog\Model\Category::ENTITY);
        $attributeSetId = $categorySetup->getDefaultAttributeSetId($entityTypeId);
        $attribute = $categorySetup->getAttribute(\Magento\Catalog\Model\Category::ENTITY, 'hawk_landing_page');
        if ($attribute) {
            $idg = $categorySetup->getAttributeGroupId($entityTypeId, $attributeSetId, 'Display Settings');
            $categorySetup->addAttributeToGroup(
                $entityTypeId,
                $attributeSetId,
                $idg,
                'hawk_landing_page',
                46
            );
            $categorySetup->updateAttribute(
                \Magento\Catalog\Model\Category::ENTITY,
                'group',
                'hawk_landing_page',
                'Display Settings'
            );
        }
    }

    private function upgradeTo_220(ModuleDataSetupInterface $setup)
    {
        /*
         * configuration changes
         * hawksearch_proxy/proxy/tracking_url_staging -> hawksearch_proxy/proxy/tracking_url_develop
         * hawksearch_proxy/proxy/tracking_url_live -> hawksearch_proxy/proxy/tracking_url_production
         * hawksearch_proxy/proxy/mode -> value "0" => "develop", value "1" => "production"
         */
        /** @var \Magento\Config\Model\ResourceModel\Config $config */
        $config = $this->config;
        $select = $config->getConnection()
            ->select()
            ->from($setup->getTable('core_config_data'))
            ->where('path in (?)', ['hawksearch_proxy/proxy/tracking_url_staging', 'hawksearch_proxy/proxy/tracking_url_live', 'hawksearch_proxy/proxy/mode'])
            ->order('path');
        foreach ($config->getConnection()->fetchAll($select) as $item) {
            if($item['path'] == 'hawksearch_proxy/proxy/mode')  {
                if($item['value'] == "0") {
                    $item['value'] = 'develop';
                } else {
                    $item['value'] = 'production';
                }
            } elseif($item['path'] == 'hawksearch_proxy/proxy/tracking_url_live') {
                $item['path'] = 'hawksearch_proxy/proxy/tracking_url_production';
            } elseif($item['path'] == 'hawksearch_proxy/proxy/tracking_url_staging') {
                $item['path'] = 'hawksearch_proxy/proxy/tracking_url_develop';
            } else {
                continue;
            }
            $config->saveConfig($item['path'], $item['value'] , $item['scope'], $item['scope_id']);
        }
        // delete old values:
        $config->deleteConfig('hawksearch_proxy/proxy/tracking_url_staging', 'default', 0);
        $config->deleteConfig('hawksearch_proxy/proxy/tracking_url_live', 'default', 0);
    }
}